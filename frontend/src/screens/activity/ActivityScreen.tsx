import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
    Text,
    Card,
    useTheme,
    ActivityIndicator,
    Chip,
    SegmentedButtons,
    Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetActivitiesQuery } from '@api/activitiesApi';
import { spacing } from '@theme';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_TYPES = [
    { value: 'all', label: 'All' },
    { value: 'expense', label: 'Expenses' },
    { value: 'settlement', label: 'Settlements' },
    { value: 'group', label: 'Groups' },
];

const getActivityIcon = (action: string) => {
    if (action.includes('expense.create')) return 'receipt-text-plus';
    if (action.includes('expense.update')) return 'receipt-text-edit';
    if (action.includes('expense.delete')) return 'receipt-text-remove';
    if (action.includes('settlement')) return 'cash-check';
    if (action.includes('group.create')) return 'account-group-outline';
    if (action.includes('group.update')) return 'account-group';
    if (action.includes('member.add')) return 'account-plus';
    if (action.includes('member.remove')) return 'account-minus';
    return 'information-outline';
};

const getActivityColor = (action: string, theme: any) => {
    if (action.includes('create') || action.includes('add')) return theme.colors.primary;
    if (action.includes('delete') || action.includes('remove')) return theme.colors.error;
    if (action.includes('update')) return theme.colors.tertiary;
    if (action.includes('settlement')) return '#4CAF50';
    return theme.colors.onSurfaceVariant;
};

const getActivityDescription = (activity: any) => {
    const { action, metadata } = activity;

    if (action === 'expense.create') {
        return `Added expense "${metadata.description || 'Unknown'}" for $${metadata.amount || '0'}`;
    }
    if (action === 'expense.update') {
        return `Updated expense "${metadata.description || 'Unknown'}"`;
    }
    if (action === 'expense.delete') {
        return `Deleted expense "${metadata.description || 'Unknown'}"`;
    }
    if (action === 'settlement.create') {
        return `Recorded settlement of $${metadata.amount || '0'}`;
    }
    if (action === 'group.create') {
        return `Created group "${metadata.name || 'Unknown'}"`;
    }
    if (action === 'group.update') {
        return `Updated group "${metadata.name || 'Unknown'}"`;
    }
    if (action === 'member.add') {
        return 'Added member to group';
    }
    if (action === 'member.remove') {
        return 'Removed member from group';
    }

    return action;
};

export const ActivityScreen = () => {
    const theme = useTheme();
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchGroup, setSearchGroup] = useState('');

    const { data, isLoading, refetch } = useGetActivitiesQuery({
        type: typeFilter === 'all' ? undefined : (typeFilter as any),
        limit: 50,
    });

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const filteredActivities = data?.activities?.filter((activity) => {
        if (!searchGroup) return true;
        return activity.metadata?.groupName?.toLowerCase().includes(searchGroup.toLowerCase());
    }) || [];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Filters */}
            <View style={styles.filtersContainer}>
                <Searchbar
                    placeholder="Search by group..."
                    onChangeText={setSearchGroup}
                    value={searchGroup}
                    style={styles.searchbar}
                />

                <SegmentedButtons
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                    buttons={ACTIVITY_TYPES}
                    style={styles.segmented}
                />
            </View>

            {/* Activity List */}
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                        <Card key={activity.id} style={styles.activityCard}>
                            <Card.Content>
                                <View style={styles.activityRow}>
                                    <View
                                        style={[
                                            styles.iconContainer,
                                            { backgroundColor: getActivityColor(activity.action, theme) + '20' },
                                        ]}
                                    >
                                        <Icon
                                            name={getActivityIcon(activity.action)}
                                            size={24}
                                            color={getActivityColor(activity.action, theme)}
                                        />
                                    </View>

                                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                                        <Text variant="titleMedium">
                                            {getActivityDescription(activity)}
                                        </Text>

                                        {activity.metadata?.groupName && (
                                            <Text
                                                variant="bodySmall"
                                                style={{ color: theme.colors.primary, marginTop: 4 }}
                                            >
                                                {activity.metadata.groupName}
                                            </Text>
                                        )}

                                        <Text
                                            variant="bodySmall"
                                            style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                                        >
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon
                            name="timeline-alert-outline"
                            size={64}
                            color={theme.colors.onSurfaceVariant}
                        />
                        <Text
                            variant="headlineSmall"
                            style={{ marginTop: spacing.md, textAlign: 'center' }}
                        >
                            No activities yet
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={{ marginTop: spacing.sm, textAlign: 'center', color: theme.colors.onSurfaceVariant }}
                        >
                            Your activity feed will appear here
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    filtersContainer: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    searchbar: {
        marginBottom: spacing.sm,
    },
    segmented: {
        marginBottom: spacing.sm,
    },
    activityCard: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        marginTop: spacing.xl * 2,
    },
});
