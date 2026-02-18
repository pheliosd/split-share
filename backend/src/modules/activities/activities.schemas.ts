import { z } from 'zod';

export const getActivitiesSchema = z.object({
    querystring: z.object({
        groupId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        type: z.enum(['expense', 'settlement', 'group', 'member']).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.coerce.number().min(1).max(100).default(20),
        offset: z.coerce.number().min(0).default(0),
    }),
});

export type GetActivitiesQuery = z.infer<typeof getActivitiesSchema>['querystring'];
