import { prisma } from '../../config/database';
import { Decimal } from 'decimal.js';

export class ExportService {
    async exportGroupExpensesCSV(
        groupId: string,
        startDate?: string,
        endDate?: string
    ): Promise<string> {
        const where: any = { groupId, isDraft: false, isDeleted: false };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                payer: { select: { name: true, email: true } },
                splits: { include: { user: { select: { name: true } } } },
            },
            orderBy: { date: 'asc' },
        });

        const rows: string[] = [
            'Date,Description,Category,Amount,Paid By,Split Type,Notes',
        ];

        for (const expense of expenses) {
            const row = [
                new Date(expense.date).toISOString().slice(0, 10),
                `"${expense.description.replace(/"/g, '""')}"`,
                expense.category || 'other',
                expense.amount.toString(),
                `"${expense.payer.name}"`,
                expense.splitType,
                `"${(expense.notes || '').replace(/"/g, '""')}"`,
            ].join(',');
            rows.push(row);
        }

        return rows.join('\n');
    }

    async exportUserExpensesCSV(
        userId: string,
        groupId?: string,
        startDate?: string,
        endDate?: string
    ): Promise<string> {
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
            include: {
                payer: { select: { name: true } },
                group: { select: { name: true } },
                splits: { where: { userId }, select: { amount: true } },
            },
            orderBy: { date: 'asc' },
        });

        const rows: string[] = [
            'Date,Description,Category,Total Amount,Your Share,Group,Paid By',
        ];

        for (const expense of expenses) {
            const yourShare = expense.splits[0]?.amount ?? new Decimal(0);
            const row = [
                new Date(expense.date).toISOString().slice(0, 10),
                `"${expense.description.replace(/"/g, '""')}"`,
                expense.category || 'other',
                expense.amount.toString(),
                yourShare.toString(),
                `"${expense.group?.name || ''}"`,
                `"${expense.payer.name}"`,
            ].join(',');
            rows.push(row);
        }

        return rows.join('\n');
    }
}
