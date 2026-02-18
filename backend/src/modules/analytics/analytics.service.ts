import { prisma } from '../../config/database';
import { Decimal } from 'decimal.js';

export class AnalyticsService {
    async getSpendingByCategory(
        userId: string,
        groupId?: string,
        startDate?: string,
        endDate?: string
    ) {
        const where: any = {
            splits: { some: { userId } },
            isDraft: false,
            isDeleted: false,
        };

        if (groupId) where.groupId = groupId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const expenses = await prisma.expense.findMany({
            where,
            select: {
                category: true,
                amount: true,
                splits: { where: { userId }, select: { amount: true } },
            },
        });

        const categoryMap: Record<string, Decimal> = {};
        for (const expense of expenses) {
            const cat = expense.category || 'other';
            const userShare = expense.splits[0]?.amount ?? new Decimal(0);
            categoryMap[cat] = (categoryMap[cat] || new Decimal(0)).plus(userShare);
        }

        const total = Object.values(categoryMap).reduce(
            (sum, v) => sum.plus(v),
            new Decimal(0)
        );

        return Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount: amount.toFixed(2),
            percentage: total.gt(0)
                ? amount.div(total).times(100).toFixed(1)
                : '0',
        }));
    }

    async getSpendingOverTime(
        userId: string,
        groupId?: string,
        startDate?: string,
        endDate?: string,
        groupBy: 'day' | 'month' = 'month'
    ) {
        const where: any = {
            splits: { some: { userId } },
            isDraft: false,
            isDeleted: false,
        };

        if (groupId) where.groupId = groupId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const expenses = await prisma.expense.findMany({
            where,
            select: {
                date: true,
                splits: { where: { userId }, select: { amount: true } },
            },
            orderBy: { date: 'asc' },
        });

        const timeMap: Record<string, Decimal> = {};
        for (const expense of expenses) {
            const d = new Date(expense.date);
            const key =
                groupBy === 'day'
                    ? d.toISOString().slice(0, 10)
                    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const userShare = expense.splits[0]?.amount ?? new Decimal(0);
            timeMap[key] = (timeMap[key] || new Decimal(0)).plus(userShare);
        }

        return Object.entries(timeMap).map(([period, amount]) => ({
            period,
            amount: amount.toFixed(2),
        }));
    }

    async getUserSummary(userId: string) {
        const [totalPaid, totalOwed, groupCount, expenseCount] = await Promise.all([
            prisma.expense.aggregate({
                where: { payerId: userId, isDraft: false, isDeleted: false },
                _sum: { amount: true },
            }),
            prisma.expenseSplit.aggregate({
                where: { userId, expense: { isDraft: false, isDeleted: false } },
                _sum: { amount: true },
            }),
            prisma.groupMember.count({ where: { userId } }),
            prisma.expense.count({
                where: {
                    splits: { some: { userId } },
                    isDraft: false,
                    isDeleted: false,
                },
            }),
        ]);

        const paid = new Decimal(totalPaid._sum.amount?.toString() || '0');
        const owed = new Decimal(totalOwed._sum.amount?.toString() || '0');

        return {
            totalPaid: paid.toFixed(2),
            totalOwed: owed.toFixed(2),
            netBalance: paid.minus(owed).toFixed(2),
            groupCount,
            expenseCount,
        };
    }

    async getGroupSummary(groupId: string) {
        const [totalExpenses, memberCount, expenseCount, topCategories] =
            await Promise.all([
                prisma.expense.aggregate({
                    where: { groupId, isDraft: false, isDeleted: false },
                    _sum: { amount: true },
                    _avg: { amount: true },
                }),
                prisma.groupMember.count({ where: { groupId } }),
                prisma.expense.count({
                    where: { groupId, isDraft: false, isDeleted: false },
                }),
                prisma.expense.groupBy({
                    by: ['category'],
                    where: { groupId, isDraft: false, isDeleted: false },
                    _sum: { amount: true },
                    orderBy: { _sum: { amount: 'desc' } },
                    take: 5,
                }),
            ]);

        return {
            totalExpenses: new Decimal(
                totalExpenses._sum.amount?.toString() || '0'
            ).toFixed(2),
            averageExpense: new Decimal(
                totalExpenses._avg.amount?.toString() || '0'
            ).toFixed(2),
            memberCount,
            expenseCount,
            topCategories: topCategories.map((c) => ({
                category: c.category || 'other',
                total: new Decimal(c._sum.amount?.toString() || '0').toFixed(2),
            })),
        };
    }

    async getTopExpenses(userId: string, groupId?: string, limit = 5) {
        const where: any = {
            splits: { some: { userId } },
            isDraft: false,
            isDeleted: false,
        };
        if (groupId) where.groupId = groupId;

        return prisma.expense.findMany({
            where,
            orderBy: { amount: 'desc' },
            take: limit,
            select: {
                id: true,
                description: true,
                amount: true,
                date: true,
                category: true,
                group: { select: { name: true } },
            },
        });
    }
}
