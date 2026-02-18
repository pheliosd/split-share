import { baseApi } from './baseApi';
import type { Expense } from '@types';

interface CreateExpenseRequest {
    groupId: string;
    description: string;
    amount: number;
    currency: string;
    date?: string;
    category?: string;
    notes?: string;
    payerId: string;
    splitType: 'equal' | 'exact' | 'percentage' | 'shares';
    splits: Array<{
        userId: string;
        amount?: number;
        percentage?: number;
        shares?: number;
    }>;
    isDraft?: boolean;
}

interface GetExpensesParams {
    groupId?: string;
    category?: string;
    payerId?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'date' | 'amount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

interface ExpensesResponse {
    expenses: Expense[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export const expensesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getExpenses: builder.query<ExpensesResponse, GetExpensesParams>({
            query: (params) => ({
                url: '/expenses',
                params,
            }),
            providesTags: ['Expense'],
        }),

        getExpense: builder.query<{ expense: Expense }, string>({
            query: (expenseId) => `/expenses/${expenseId}`,
            providesTags: (_result, _error, id) => [{ type: 'Expense', id }],
        }),

        createExpense: builder.mutation<{ expense: Expense }, CreateExpenseRequest>({
            query: (data) => ({
                url: '/expenses',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Expense', 'Group'],
        }),

        updateExpense: builder.mutation<
            { expense: Expense },
            { expenseId: string; data: Partial<CreateExpenseRequest> }
        >({
            query: ({ expenseId, data }) => ({
                url: `/expenses/${expenseId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { expenseId }) => [
                { type: 'Expense', id: expenseId },
                'Expense',
                'Group',
            ],
        }),

        deleteExpense: builder.mutation<{ message: string }, string>({
            query: (expenseId) => ({
                url: `/expenses/${expenseId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Expense', 'Group'],
        }),

        addComment: builder.mutation<
            { comment: any },
            { expenseId: string; comment: string }
        >({
            query: ({ expenseId, comment }) => ({
                url: `/expenses/${expenseId}/comments`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: (_result, _error, { expenseId }) => [
                { type: 'Expense', id: expenseId },
            ],
        }),
    }),
});

export const {
    useGetExpensesQuery,
    useGetExpenseQuery,
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useAddCommentMutation,
} = expensesApi;
