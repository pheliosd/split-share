import { baseApi } from './baseApi';
import type { Group, GroupMember } from '@types';

interface CreateGroupRequest {
    name: string;
    description?: string;
    type: 'trip' | 'home' | 'couple' | 'office' | 'other';
    currency: string;
    memberIds: string[];
}

interface UpdateGroupRequest {
    name?: string;
    description?: string;
    simplifyDebts?: boolean;
}

interface AddMembersRequest {
    userIds: string[];
}

interface Balance {
    userId: string;
    userName: string;
    balance: string;
}

interface SimplifiedDebt {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: string;
}

export const groupsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getGroups: builder.query<{ groups: Group[] }, void>({
            query: () => '/groups',
            providesTags: ['Group'],
        }),

        getGroup: builder.query<{ group: Group }, string>({
            query: (groupId) => `/groups/${groupId}`,
            providesTags: (_result, _error, id) => [{ type: 'Group', id }],
        }),

        createGroup: builder.mutation<{ group: Group }, CreateGroupRequest>({
            query: (data) => ({
                url: '/groups',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Group'],
        }),

        updateGroup: builder.mutation<
            { group: Group },
            { groupId: string; data: UpdateGroupRequest }
        >({
            query: ({ groupId, data }) => ({
                url: `/groups/${groupId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { groupId }) => [
                { type: 'Group', id: groupId },
                'Group',
            ],
        }),

        addMembers: builder.mutation<
            { members: GroupMember[] },
            { groupId: string; data: AddMembersRequest }
        >({
            query: ({ groupId, data }) => ({
                url: `/groups/${groupId}/members`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, { groupId }) => [
                { type: 'Group', id: groupId },
            ],
        }),

        removeMember: builder.mutation<
            { message: string },
            { groupId: string; userId: string }
        >({
            query: ({ groupId, userId }) => ({
                url: `/groups/${groupId}/members/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { groupId }) => [
                { type: 'Group', id: groupId },
            ],
        }),

        archiveGroup: builder.mutation<{ group: Group }, string>({
            query: (groupId) => ({
                url: `/groups/${groupId}/archive`,
                method: 'POST',
            }),
            invalidatesTags: ['Group'],
        }),

        getGroupBalances: builder.query<
            { balances: Balance[]; simplifiedDebts: SimplifiedDebt[] },
            string
        >({
            query: (groupId) => `/groups/${groupId}/balances`,
            providesTags: (_result, _error, id) => [
                { type: 'Group', id },
                'Expense',
                'Settlement',
            ],
        }),
    }),
});

export const {
    useGetGroupsQuery,
    useGetGroupQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useAddMembersMutation,
    useRemoveMemberMutation,
    useArchiveGroupMutation,
    useGetGroupBalancesQuery,
} = groupsApi;
