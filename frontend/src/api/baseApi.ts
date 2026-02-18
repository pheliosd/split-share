import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const API_URL = __DEV__
    ? 'http://10.0.2.2:3000/api/v1'   // Android emulator → localhost
    : 'https://api.splitwise-app.com/api/v1';

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    timeout: 10000,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

// Retry up to 3 times for network errors, skip retry for 4xx client errors
const baseQueryWithRetry = retry(baseQuery, {
    maxRetries: 3,
    backoff: async (attempt) => {
        // Exponential backoff: 500ms, 1s, 2s
        await new Promise((resolve) =>
            setTimeout(resolve, Math.min(500 * 2 ** attempt, 5000))
        );
    },
});

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithRetry,
    tagTypes: [
        'Auth', 'User', 'Group', 'Expense', 'Settlement', 'Friend',
        'Activity', 'Analytics', 'Currency',
    ],
    endpoints: () => ({}),
});

