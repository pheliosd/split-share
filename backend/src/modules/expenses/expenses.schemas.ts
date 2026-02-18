import { z } from 'zod';

// Split type enum
export const splitTypeEnum = z.enum(['equal', 'exact', 'percentage', 'shares']);

// Split schema for different types
export const expenseSplitSchema = z.object({
    userId: z.string().uuid(),
    amount: z.number().positive().optional(),
    percentage: z.number().min(0).max(100).optional(),
    shares: z.number().int().positive().optional(),
});

// Create expense schema
export const createExpenseSchema = z.object({
    groupId: z.string().uuid(),
    description: z.string().min(1).max(255),
    amount: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    category: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
    payerId: z.string().uuid(),
    splitType: splitTypeEnum,
    splits: z.array(expenseSplitSchema).min(1),
    isDraft: z.boolean().default(false),
}).refine(
    (data) => {
        // Validate split data matches split type
        if (data.splitType === 'equal') {
            return data.splits.every(s => !s.amount && !s.percentage && !s.shares);
        }
        if (data.splitType === 'exact') {
            return data.splits.every(s => s.amount !== undefined && s.amount > 0);
        }
        if (data.splitType === 'percentage') {
            return data.splits.every(s => s.percentage !== undefined && s.percentage > 0);
        }
        if (data.splitType === 'shares') {
            return data.splits.every(s => s.shares !== undefined && s.shares > 0);
        }
        return true;
    },
    { message: 'Split data does not match split type' }
).refine(
    (data) => {
        // For exact splits, validate total equals expense amount
        if (data.splitType === 'exact') {
            const total = data.splits.reduce((sum, s) => sum + (s.amount || 0), 0);
            return Math.abs(total - data.amount) < 0.01; // Allow 1 cent tolerance
        }
        return true;
    },
    { message: 'Split amounts must equal total expense amount' }
).refine(
    (data) => {
        // For percentage splits, validate total equals 100%
        if (data.splitType === 'percentage') {
            const total = data.splits.reduce((sum, s) => sum + (s.percentage || 0), 0);
            return Math.abs(total - 100) < 0.01;
        }
        return true;
    },
    { message: 'Split percentages must sum to 100%' }
);

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;

// Update expense schema
export const updateExpenseSchema = z.object({
    description: z.string().min(1).max(255).optional(),
    amount: z.number().positive().optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    category: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
    payerId: z.string().uuid().optional(),
    splitType: splitTypeEnum.optional(),
    splits: z.array(expenseSplitSchema).min(1).optional(),
});

export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;

// Expense filters schema
export const expenseFiltersSchema = z.object({
    groupId: z.string().uuid().optional(),
    category: z.string().optional(),
    payerId: z.string().uuid().optional(),
    startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    minAmount: z.number().positive().optional(),
    maxAmount: z.number().positive().optional(),
    search: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
    sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ExpenseFiltersDto = z.infer<typeof expenseFiltersSchema>;

// Add comment schema
export const addCommentSchema = z.object({
    comment: z.string().min(1).max(1000),
});

export type AddCommentDto = z.infer<typeof addCommentSchema>;
