import { z } from 'zod';

// Registration schema
export const registerSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(8).max(100),
    name: z.string().min(1).max(255),
    defaultCurrency: z.string().length(3).optional().default('USD'),
}).refine(
    (data) => data.email || data.phone,
    { message: 'Either email or phone is required' }
);

export type RegisterDto = z.infer<typeof registerSchema>;

// Login schema
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type LoginDto = z.infer<typeof loginSchema>;

// OAuth login schema
export const oauthLoginSchema = z.object({
    provider: z.enum(['google', 'apple']),
    idToken: z.string().min(1),
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
});

export type OAuthLoginDto = z.infer<typeof oauthLoginSchema>;

// Refresh token schema
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

// Verify email schema
export const verifyEmailSchema = z.object({
    token: z.string().min(1),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

// Change password schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

// Reset password request schema
export const resetPasswordRequestSchema = z.object({
    email: z.string().email(),
});

export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8).max(100),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
