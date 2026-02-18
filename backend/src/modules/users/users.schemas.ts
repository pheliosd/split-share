import { z } from 'zod';

// Update user profile schema
export const updateProfileSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    avatarUrl: z.string().url().optional(),
    defaultCurrency: z.string().length(3).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

// Search users schema
export const searchUsersSchema = z.object({
    q: z.string().min(1),
    limit: z.number().int().min(1).max(50).optional().default(20),
});

export type SearchUsersDto = z.infer<typeof searchUsersSchema>;

// Add friend schema
export const addFriendSchema = z.object({
    friendId: z.string().uuid(),
});

export type AddFriendDto = z.infer<typeof addFriendSchema>;
