import { baseApi } from './baseApi';

interface CreateSettlementRequest {
    groupId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
    notes?: string;
    date?: string;
}

interface GetSettlementsParams {
    groupId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export const settlementsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSettlements: builder.query<any, GetSettlementsParams>({
            query: (params) => ({
                url: '/settlements',
                params,
            }),
            providesTags: ['Settlement'],
        }),

        getSettlement: builder.query<any, string>({
            query: (settlementId) => `/settlements/${settlementId}`,
            providesTags: (_result, _error, id) => [{ type: 'Settlement', id }],
        }),

        createSettlement: builder.mutation<any, CreateSettlementRequest>({
            query: (data) => ({
                url: '/settlements',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Settlement', 'Group'],
        }),

        deleteSettlement: builder.mutation<{ message: string }, string>({
            query: (settlementId) => ({
                url: `/settlements/${settlementId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Settlement', 'Group'],
        }),
    }),
});

export const {
    useGetSettlementsQuery,
    useGetSettlementQuery,
    useCreateSettlementMutation,
    useDeleteSettlementMutation,
} = settlementsApi;
