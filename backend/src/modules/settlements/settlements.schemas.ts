import { z } from 'zod';

// Create settlement schema
export const createSettlementSchema = z.object({
    groupId: z.string().uuid(),
    payerId: z.string().uuid(),
    payeeId: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    paymentMethod: z.string().max(50).optional(),
    notes: z.string().max(500).optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
}).refine(
    (data) => data.payerId !== data.payeeId,
    { message: 'Payer and payee must be different users' }
);

export type CreateSettlementDto = z.infer<typeof createSettlementSchema>;

// Settlement filters schema
export const settlementFiltersSchema = z.object({
    groupId: z.string().uuid().optional(),
    startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
});

export type SettlementFiltersDto = z.infer<typeof settlementFiltersSchema>;
