import { PrismaClient, Expense, ExpenseSplit } from '@prisma/client';
import { prisma } from '../../server';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseFiltersDto } from './expenses.schemas';
import { MoneyCalculator } from '../../common/utils/money-calculator';
import Decimal from 'decimal.js';

export class ExpensesService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    /**
     * Calculate owed amounts for each split based on split type
     */
    private calculateSplitAmounts(
        totalAmount: number,
        splitType: string,
        splits: Array<{
            userId: string;
            amount?: number;
            percentage?: number;
            shares?: number;
        }>
    ): Array<{ userId: string; owedAmount: number }> {
        switch (splitType) {
            case 'equal':
                const equalAmounts = MoneyCalculator.split(totalAmount, splits.length);
                return splits.map((split, index) => ({
                    userId: split.userId,
                    owedAmount: equalAmounts[index],
                }));

            case 'exact':
                return splits.map(split => ({
                    userId: split.userId,
                    owedAmount: split.amount!,
                }));

            case 'percentage':
                const percentages = splits.map(s => s.percentage!);
                const percentageAmounts = MoneyCalculator.splitByPercentage(totalAmount, percentages);
                return splits.map((split, index) => ({
                    userId: split.userId,
                    owedAmount: percentageAmounts[index],
                }));

            case 'shares':
                const shares = splits.map(s => s.shares!);
                const shareAmounts = MoneyCalculator.splitByShares(totalAmount, shares);
                return splits.map((split, index) => ({
                    userId: split.userId,
                    owedAmount: shareAmounts[index],
                }));

            default:
                throw new Error('Invalid split type');
        }
    }

    /**
     * Update balances after expense creation/update/deletion
     */
    private async updateBalances(
        groupId: string,
        affectedUserIds: string[],
        currency: string
    ): Promise<void> {
        for (const userId of affectedUserIds) {
            // Recalculate user's balance from scratch
            const paidByUser = await this.prisma.expense.aggregate({
                where: {
                    groupId,
                    payerId: userId,
                    isDraft: false,
                },
                _sum: {
                    amount: true,
                },
            });

            const owedByUser = await this.prisma.expenseSplit.aggregate({
                where: {
                    userId,
                    expense: {
                        groupId,
                        isDraft: false,
                    },
                },
                _sum: {
                    owedAmount: true,
                },
            });

            const settlementsReceived = await this.prisma.settlement.aggregate({
                where: {
                    groupId,
                    payeeId: userId,
                },
                _sum: {
                    amount: true,
                },
            });

            const settlementsPaid = await this.prisma.settlement.aggregate({
                where: {
                    groupId,
                    payerId: userId,
                },
                _sum: {
                    amount: true,
                },
            });

            const balance = MoneyCalculator.subtract(
                MoneyCalculator.add(
                    Number(paidByUser._sum.amount || 0),
                    Number(settlementsReceived._sum.amount || 0)
                ),
                MoneyCalculator.add(
                    Number(owedByUser._sum.owedAmount || 0),
                    Number(settlementsPaid._sum.amount || 0)
                )
            );

            // Upsert balance
            await this.prisma.balance.upsert({
                where: {
                    groupId_userId_currency: {
                        groupId,
                        userId,
                        currency,
                    },
                },
                create: {
                    groupId,
                    userId,
                    currency,
                    balance: new Decimal(balance),
                },
                update: {
                    balance: new Decimal(balance),
                },
            });
        }
    }

    /**
     * Create a new expense
     */
    async createExpense(userId: string, dto: CreateExpenseDto): Promise<Expense> {
        // Verify user is member of group
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId: dto.groupId,
                userId,
            },
        });

        if (!member) {
            throw new Error('You are not a member of this group');
        }

        // Verify all split users are group members
        const groupMembers = await this.prisma.groupMember.findMany({
            where: {
                groupId: dto.groupId,
            },
            select: {
                userId: true,
            },
        });

        const memberIds = new Set(groupMembers.map(m => m.userId));
        const invalidUsers = dto.splits.filter(s => !memberIds.has(s.userId));

        if (invalidUsers.length > 0) {
            throw new Error('Some split users are not group members');
        }

        // Calculate split amounts
        const splitAmounts = this.calculateSplitAmounts(
            dto.amount,
            dto.splitType,
            dto.splits
        );

        // Get group currency for FX rate (if needed)
        const group = await this.prisma.group.findUnique({
            where: { id: dto.groupId },
            select: { currency: true },
        });

        // Create expense with splits in a transaction
        const expense = await this.prisma.$transaction(async (tx) => {
            // Create expense
            const newExpense = await tx.expense.create({
                data: {
                    groupId: dto.groupId,
                    description: dto.description,
                    amount: new Decimal(dto.amount),
                    currency: dto.currency,
                    date: new Date(dto.date),
                    category: dto.category,
                    notes: dto.notes,
                    payerId: dto.payerId,
                    splitType: dto.splitType,
                    createdBy: userId,
                    isDraft: dto.isDraft,
                    groupCurrency: group?.currency,
                    exchangeRateToGroupCurrency: dto.currency === group?.currency ? 1 : undefined,
                },
            });

            // Create splits
            for (let i = 0; i < dto.splits.length; i++) {
                const split = dto.splits[i];
                const owedAmount = splitAmounts[i].owedAmount;

                await tx.expenseSplit.create({
                    data: {
                        expenseId: newExpense.id,
                        userId: split.userId,
                        amount: split.amount ? new Decimal(split.amount) : undefined,
                        percentage: split.percentage ? new Decimal(split.percentage) : undefined,
                        shares: split.shares,
                        owedAmount: new Decimal(owedAmount),
                    },
                });
            }

            // Create history entry
            await tx.expenseHistory.create({
                data: {
                    expenseId: newExpense.id,
                    action: 'created',
                    changedBy: userId,
                    changes: {
                        description: dto.description,
                        amount: dto.amount,
                        payerId: dto.payerId,
                        splitType: dto.splitType,
                    },
                },
            });

            return newExpense;
        });

        // Update balances if not draft
        if (!dto.isDraft) {
            const affectedUserIds = new Set([
                dto.payerId,
                ...dto.splits.map(s => s.userId),
            ]);

            await this.updateBalances(
                dto.groupId,
                Array.from(affectedUserIds),
                dto.currency
            );
        }

        return expense;
    }

    /**
     * Get expenses with filters
     */
    async getExpenses(userId: string, filters: ExpenseFiltersDto) {
        // Build where clause
        const where: any = {
            isDraft: false,
        };

        if (filters.groupId) {
            // Verify user is member
            const member = await this.prisma.groupMember.findFirst({
                where: {
                    groupId: filters.groupId,
                    userId,
                },
            });

            if (!member) {
                throw new Error('You are not a member of this group');
            }

            where.groupId = filters.groupId;
        } else {
            // Get all groups user is member of
            const userGroups = await this.prisma.groupMember.findMany({
                where: { userId },
                select: { groupId: true },
            });

            where.groupId = { in: userGroups.map(g => g.groupId) };
        }

        if (filters.category) {
            where.category = filters.category;
        }

        if (filters.payerId) {
            where.payerId = filters.payerId;
        }

        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) {
                where.date.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.date.lte = new Date(filters.endDate);
            }
        }

        if (filters.minAmount || filters.maxAmount) {
            where.amount = {};
            if (filters.minAmount) {
                where.amount.gte = new Decimal(filters.minAmount);
            }
            if (filters.maxAmount) {
                where.amount.lte = new Decimal(filters.maxAmount);
            }
        }

        if (filters.search) {
            where.OR = [
                { description: { contains: filters.search, mode: 'insensitive' } },
                { notes: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        // Get total count
        const total = await this.prisma.expense.count({ where });

        // Get expenses
        const expenses = await this.prisma.expense.findMany({
            where,
            include: {
                payer: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                splits: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                [filters.sortBy]: filters.sortOrder,
            },
            skip: filters.offset,
            take: filters.limit,
        });

        return {
            expenses,
            total,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: filters.offset + filters.limit < total,
        };
    }

    /**
     * Get expense by ID
     */
    async getExpenseById(expenseId: string, userId: string) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: expenseId },
            include: {
                payer: true,
                splits: {
                    include: {
                        user: true,
                    },
                },
                group: true,
                history: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                comments: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!expense) {
            throw new Error('Expense not found');
        }

        // Verify user is group member
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId: expense.groupId,
                userId,
            },
        });

        if (!member) {
            throw new Error('You are not a member of this group');
        }

        return expense;
    }

    /**
     * Update expense
     */
    async updateExpense(
        expenseId: string,
        userId: string,
        dto: UpdateExpenseDto
    ): Promise<Expense> {
        const expense = await this.getExpenseById(expenseId, userId);

        if (expense.isFrozen) {
            throw new Error('Cannot update frozen expense');
        }

        // Track changes for history
        const changes: any = {};

        if (dto.description) changes.description = { from: expense.description, to: dto.description };
        if (dto.amount) changes.amount = { from: Number(expense.amount), to: dto.amount };
        if (dto.payerId) changes.payerId = { from: expense.payerId, to: dto.payerId };

        // Update in transaction
        const updated = await this.prisma.$transaction(async (tx) => {
            // Update expense
            const updatedExpense = await tx.expense.update({
                where: { id: expenseId },
                data: {
                    description: dto.description,
                    amount: dto.amount ? new Decimal(dto.amount) : undefined,
                    date: dto.date ? new Date(dto.date) : undefined,
                    category: dto.category,
                    notes: dto.notes,
                    payerId: dto.payerId,
                    splitType: dto.splitType,
                },
            });

            // If splits changed, recreate them
            if (dto.splits && dto.splitType) {
                // Delete old splits
                await tx.expenseSplit.deleteMany({
                    where: { expenseId },
                });

                // Calculate new split amounts
                const splitAmounts = this.calculateSplitAmounts(
                    dto.amount || Number(expense.amount),
                    dto.splitType,
                    dto.splits
                );

                // Create new splits
                for (let i = 0; i < dto.splits.length; i++) {
                    const split = dto.splits[i];
                    const owedAmount = splitAmounts[i].owedAmount;

                    await tx.expenseSplit.create({
                        data: {
                            expenseId,
                            userId: split.userId,
                            amount: split.amount ? new Decimal(split.amount) : undefined,
                            percentage: split.percentage ? new Decimal(split.percentage) : undefined,
                            shares: split.shares,
                            owedAmount: new Decimal(owedAmount),
                        },
                    });
                }
            }

            // Create history entry
            await tx.expenseHistory.create({
                data: {
                    expenseId,
                    action: 'updated',
                    changedBy: userId,
                    changes,
                },
            });

            return updatedExpense;
        });

        // Update balances
        const splits = await this.prisma.expenseSplit.findMany({
            where: { expenseId },
            select: { userId: true },
        });

        const affectedUserIds = new Set([
            expense.payerId,
            dto.payerId || expense.payerId,
            ...splits.map(s => s.userId),
        ]);

        await this.updateBalances(
            expense.groupId,
            Array.from(affectedUserIds),
            expense.currency
        );

        return updated;
    }

    /**
     * Delete expense
     */
    async deleteExpense(expenseId: string, userId: string): Promise<void> {
        const expense = await this.getExpenseById(expenseId, userId);

        if (expense.isFrozen) {
            throw new Error('Cannot delete frozen expense');
        }

        // Get affected users before deletion
        const splits = await this.prisma.expenseSplit.findMany({
            where: { expenseId },
            select: { userId: true },
        });

        const affectedUserIds = new Set([
            expense.payerId,
            ...splits.map(s => s.userId),
        ]);

        // Delete in transaction
        await this.prisma.$transaction(async (tx) => {
            // Create deletion history
            await tx.expenseHistory.create({
                data: {
                    expenseId,
                    action: 'deleted',
                    changedBy: userId,
                    changes: {
                        deletedAt: new Date(),
                    },
                },
            });

            // Delete expense (cascades to splits, comments)
            await tx.expense.delete({
                where: { id: expenseId },
            });
        });

        // Update balances
        await this.updateBalances(
            expense.groupId,
            Array.from(affectedUserIds),
            expense.currency
        );
    }

    /**
     * Add comment to expense
     */
    async addComment(expenseId: string, userId: string, comment: string) {
        const expense = await this.getExpenseById(expenseId, userId);

        return await this.prisma.expenseComment.create({
            data: {
                expenseId,
                userId,
                comment,
            },
            include: {
                user: true,
            },
        });
    }
}
