import { PrismaClient, Settlement } from '@prisma/client';
import { prisma } from '../../server';
import { CreateSettlementDto, SettlementFiltersDto } from './settlements.schemas';
import Decimal from 'decimal.js';
import { MoneyCalculator } from '../../common/utils/money-calculator';

export class SettlementsService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    /**
     * Update balances after settlement
     */
    private async updateBalances(
        groupId: string,
        payerId: string,
        payeeId: string,
        currency: string
    ): Promise<void> {
        for (const userId of [payerId, payeeId]) {
            // Recalculate balance from scratch
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
     * Create a new settlement
     */
    async createSettlement(userId: string, dto: CreateSettlementDto): Promise<Settlement> {
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

        // Verify payer and payee are group members
        const members = await this.prisma.groupMember.findMany({
            where: {
                groupId: dto.groupId,
                userId: { in: [dto.payerId, dto.payeeId] },
            },
        });

        if (members.length !== 2) {
            throw new Error('Payer and payee must be group members');
        }

        // Create settlement
        const settlement = await this.prisma.settlement.create({
            data: {
                groupId: dto.groupId,
                payerId: dto.payerId,
                payeeId: dto.payeeId,
                amount: new Decimal(dto.amount),
                currency: dto.currency,
                paymentMethod: dto.paymentMethod,
                notes: dto.notes,
                date: dto.date ? new Date(dto.date) : new Date(),
            },
            include: {
                payer: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                payee: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Update balances
        await this.updateBalances(
            dto.groupId,
            dto.payerId,
            dto.payeeId,
            dto.currency
        );

        return settlement;
    }

    /**
     * Get settlements with filters
     */
    async getSettlements(userId: string, filters: SettlementFiltersDto) {
        // Build where clause
        const where: any = {};

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

        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) {
                where.date.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.date.lte = new Date(filters.endDate);
            }
        }

        // Get total count
        const total = await this.prisma.settlement.count({ where });

        // Get settlements
        const settlements = await this.prisma.settlement.findMany({
            where,
            include: {
                payer: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                payee: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
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
                date: 'desc',
            },
            skip: filters.offset,
            take: filters.limit,
        });

        return {
            settlements,
            total,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: filters.offset + filters.limit < total,
        };
    }

    /**
     * Get settlement by ID
     */
    async getSettlementById(settlementId: string, userId: string) {
        const settlement = await this.prisma.settlement.findUnique({
            where: { id: settlementId },
            include: {
                payer: true,
                payee: true,
                group: true,
            },
        });

        if (!settlement) {
            throw new Error('Settlement not found');
        }

        // Verify user is group member
        const member = await this.prisma.groupMember.findFirst({
            where: {
                groupId: settlement.groupId,
                userId,
            },
        });

        if (!member) {
            throw new Error('You are not a member of this group');
        }

        return settlement;
    }

    /**
     * Delete settlement (if needed)
     */
    async deleteSettlement(settlementId: string, userId: string): Promise<void> {
        const settlement = await this.getSettlementById(settlementId, userId);

        // Only payer or payee can delete
        if (settlement.payerId !== userId && settlement.payeeId !== userId) {
            throw new Error('Only payer or payee can delete this settlement');
        }

        await this.prisma.settlement.delete({
            where: { id: settlementId },
        });

        // Update balances
        await this.updateBalances(
            settlement.groupId,
            settlement.payerId,
            settlement.payeeId,
            settlement.currency
        );
    }
}
