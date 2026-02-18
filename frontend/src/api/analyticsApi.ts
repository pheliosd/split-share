import { baseApi } from './baseApi';

interface CategoryData {
    category: string;
    amount: string;
    percentage: string;
}

interface TimeSeriesData {
    period: string;
    amount: string;
}

interface UserSummary {
    totalPaid: string;
    totalOwed: string;
    netBalance: string;
    groupCount: number;
    expenseCount: number;
}

interface GroupSummary {
    totalExpenses: string;
    averageExpense: string;
    memberCount: number;
    expenseCount: number;
    topCategories: { category: string; total: string }[];
}

interface AnalyticsParams {
    groupId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'month';
    limit?: number;
}

export const analyticsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSpendingByCategory: builder.query<{ data: CategoryData[] }, AnalyticsParams>({
            query: (params) => ({ url: '/analytics/spending/category', params }),
            providesTags: ['Expense'],
        }),

        getSpendingOverTime: builder.query<{ data: TimeSeriesData[] }, AnalyticsParams>({
            query: (params) => ({ url: '/analytics/spending/time', params }),
            providesTags: ['Expense'],
        }),

        getUserSummary: builder.query<{ data: UserSummary }, void>({
            query: () => '/analytics/user/summary',
            providesTags: ['Expense', 'Settlement'],
        }),

        getGroupSummary: builder.query<{ data: GroupSummary }, string>({
            query: (groupId) => `/analytics/group/${groupId}`,
            providesTags: (_r, _e, id) => [{ type: 'Group', id }],
        }),

        getTopExpenses: builder.query<{ data: any[] }, AnalyticsParams>({
            query: (params) => ({ url: '/analytics/top-expenses', params }),
            providesTags: ['Expense'],
        }),
    }),
});

export const {
    useGetSpendingByCategoryQuery,
    useGetSpendingOverTimeQuery,
    useGetUserSummaryQuery,
    useGetGroupSummaryQuery,
    useGetTopExpensesQuery,
} = analyticsApi;
