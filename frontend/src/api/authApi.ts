import { baseApi } from './baseApi';
import type { User } from '@types';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    name: string;
    email: string;
    phone?: string;
    password: string;
    defaultCurrency?: string;
}

interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

interface RefreshTokenRequest {
    refreshToken: string;
}

interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),

        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (data) => ({
                url: '/auth/register',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),

        refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
            query: (data) => ({
                url: '/auth/refresh',
                method: 'POST',
                body: data,
            }),
        }),

        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),

        getCurrentUser: builder.query<{ user: User }, void>({
            query: () => '/auth/me',
            providesTags: ['Auth', 'User'],
        }),

        changePassword: builder.mutation<void, ChangePasswordRequest>({
            query: (data) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
} = authApi;
