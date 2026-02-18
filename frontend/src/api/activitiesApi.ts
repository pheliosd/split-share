import { baseApi } from './baseApi';

interface Activity {
    id: string;
    userId: string;
    action: string;
    metadata: Record<string, any>;
    timestamp: string;
    ipAddress?: string;
}

interface GetActivitiesParams {
    groupId?: string;
    userId?: string;
    type?: 'expense' | 'settlement' | 'group' | 'member';
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

interface ActivitiesResponse {
    activities: Activity[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export const activitiesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getActivities: builder.query<ActivitiesResponse, GetActivitiesParams>({
            query: (params) => ({
                url: '/activities',
                params,
            }),
            providesTags: ['Activity'],
        }),

        getActivity: builder.query<{ activity: Activity }, string>({
            query: (activityId) => `/activities/${activityId}`,
            providesTags: (_result, _error, id) => [{ type: 'Activity', id }],
        }),

        getGroupActivities: builder.query<
            ActivitiesResponse,
            { groupId: string; limit?: number; offset?: number }
        >({
            query: ({ groupId, limit, offset }) => ({
                url: `/activities/group/${groupId}`,
                params: { limit, offset },
            }),
            providesTags: (_result, _error, { groupId }) => [
                { type: 'Activity', id: groupId },
            ],
        }),
    }),
});

export const {
    useGetActivitiesQuery,
    useGetActivityQuery,
    useGetGroupActivitiesQuery,
} = activitiesApi;
