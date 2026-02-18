import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, FAB, useTheme, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useGetGroupsQuery } from '@api/groupsApi';
import { spacing } from '@theme';

export const GroupListScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { data, isLoading, refetch } = useGetGroupsQuery();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const filteredGroups = React.useMemo(() => {
        if (!data?.groups) return [];
        if (!searchQuery) return data.groups;

        return data.groups.filter((group: any) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Searchbar
                placeholder="Search groups..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredGroups.length > 0 ? (
                    filteredGroups.map((group: any) => (
                        <Card
                            key={group.id}
                            style={styles.groupCard}
                            onPress={() =>
                                navigation.navigate('GroupDetail', { groupId: group.id })
                            }
                        >
                            <Card.Content>
                                <View style={styles.groupHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="titleLarge">{group.name}</Text>
                                        {group.description && (
                                            <Text
                                                variant="bodyMedium"
                                                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                                            >
                                                {group.description}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.groupBadge}>
                                        <Text variant="labelSmall">{group.type || 'other'}</Text>
                                    </View>
                                </View>

                                <View style={styles.groupMeta}>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        {group._count?.members || 0} members
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                                        {group.currency || 'USD'}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: spacing.md }}>
                            {searchQuery ? 'No groups found' : 'No groups yet'}
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}
                        >
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Create your first group to start tracking expenses'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <FAB
                icon="plus"
                label="New Group"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('CreateGroup')}
            />
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
    searchbar: {
        margin: spacing.md,
    },
    groupCard: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    groupBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#E3F2FD',
    },
    groupMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
