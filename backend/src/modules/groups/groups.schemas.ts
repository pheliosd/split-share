import { z } from 'zod';

// Create group schema
export const createGroupSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    type: z.enum(['trip', 'home', 'couple', 'office', 'other']).default('other'),
    currency: z.string().length(3).default('USD'),
    memberIds: z.array(z.string().uuid()).min(1),
    parentGroupId: z.string().uuid().optional(),
});

export type CreateGroupDto = z.infer<typeof createGroupSchema>;

// Update group schema
export const updateGroupSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    simplifyDebts: z.boolean().optional(),
});

export type UpdateGroupDto = z.infer<typeof updateGroupSchema>;

// Add members schema
export const addMembersSchema = z.object({
    userIds: z.array(z.string().uuid()).min(1),
});

export type AddMembersDto = z.infer<typeof addMembersSchema>;
