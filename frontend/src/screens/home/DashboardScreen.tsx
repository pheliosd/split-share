import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { useGetGroupsQuery, useGetGroupBalancesQuery } from '@api/groupsApi';
import { useGetExpensesQuery } from '@api/expensesApi';
import { useAppSelector } from '@hooks/redux';
import { spacing } from '@theme';
import { format } from 'date-fns';


// Child component: fetches one group's balance and calls onBalance with the user's net
const GroupBalanceFetcher = ({
    groupId,
    currentUserId,
    onBalance,
}: {
    groupId: string;
    currentUserId: string;
    onBalance: (groupId: string, balance: number) => void;
}) => {
    const { data } = useGetGroupBalancesQuery(groupId);
    React.useEffect(() => {
        if (data?.balances) {
            const entry = data.balances.find((b: any) => b.userId === currentUserId);
            onBalance(groupId, entry ? parseFloat(entry.balance) : 0);
        }
    }, [data, groupId, currentUserId, onBalance]);
    return null;
};

// Balance summary card — renders one GroupBalanceFetcher per group and sums results
const BalanceSummaryCard = ({ groupIds, currentUserId }: { groupIds: string[]; currentUserId: string }) => {
    const theme = useTheme();
    const [balances, setBalances] = React.useState<Record<string, number>>({});

    const handleBalance = React.useCallback((groupId: string, balance: number) => {
        setBalances((prev) => ({ ...prev, [groupId]: balance }));
    }, []);

    const netBalance = useMemo(
        () => Object.values(balances).reduce((sum, b) => sum + b, 0),
        [balances]
    );

    const balanceColor =
        netBalance > 0.01
            ? '#4CAF50'
            : netBalance < -0.01
                ? theme.colors.error
                : theme.colors.onSurfaceVariant;

    const balanceLabel =
        netBalance > 0.01
            ? `You are owed $${netBalance.toFixed(2)}`
            : netBalance < -0.01
                ? `You owe $${Math.abs(netBalance).toFixed(2)}`
                : 'All settled up! 🎉';

    return (
        <Card style={{ margin: 16, marginBottom: 8 }}>
            {groupIds.map((id) => (
                <GroupBalanceFetcher
                    key={id}
                    groupId={id}
                    currentUserId={currentUserId}
                    onBalance={handleBalance}
                />
            ))}
            <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Total Balance
                </Text>
                <Text
                    variant="displaySmall"
                    style={{ color: balanceColor, fontWeight: 'bold' }}
                >
                    {netBalance >= 0 ? '+' : ''}${netBalance.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={{ color: balanceColor }}>
                    {balanceLabel}
                </Text>
            </Card.Content>
        </Card>
    );
};


export const DashboardScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const currentUser = useAppSelector((state: any) => state.auth.user);
    const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = useGetGroupsQuery();
    const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useGetExpensesQuery({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const [refreshing, setRefreshing] = React.useState(false);
    const groupIds = useMemo(
        () => (groupsData?.groups || []).map((g: any) => g.id),
        [groupsData]
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchGroups(), refetchExpenses()]);
        setRefreshing(false);
    };

    if (groupsLoading && expensesLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Real Balance Overview */}
                {currentUser?.id && groupIds.length > 0 ? (
                    <BalanceSummaryCard groupIds={groupIds} currentUserId={currentUser.id} />
                ) : (
                    <Card style={styles.balanceCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                Total Balance
                            </Text>
                            <Text variant="displaySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                                $0.00
                            </Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                No groups yet
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <Button
                        mode="contained"
                        icon="plus"
                        onPress={() => navigation.navigate('AddExpense')}
                        style={styles.actionButton}
                    >
                        Add Expense
                    </Button>
                </View>

                {/* Groups Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleLarge">Your Groups</Text>
                    </View>

                    {groupsData?.groups && groupsData.groups.length > 0 ? (
                        groupsData.groups.slice(0, 3).map((group: any) => (
                            <Card
                                key={group.id}
                                style={styles.groupCard}
                                onPress={() => navigation.navigate('Groups', {
                                    screen: 'GroupDetail',
                                    params: { groupId: group.id },
                                })}
                            >
                                <Card.Content>
                                    <Text variant="titleMedium">{group.name}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        {group._count?.members || 0} members
                                    </Text>
                                </Card.Content>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Card.Content>
                                <Text variant="bodyMedium">No groups yet. Create one to start!</Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>

                {/* Recent Expenses */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleLarge">Recent Expenses</Text>
                    </View>

                    {expensesData?.expenses && expensesData.expenses.length > 0 ? (
                        expensesData.expenses.map((expense: any) => (
                            <Card
                                key={expense.id}
                                style={styles.expenseCard}
                                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
                            >
                                <Card.Content>
                                    <View style={styles.expenseRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="titleMedium">{expense.description}</Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                {format(new Date(expense.date), 'MMM dd, yyyy')}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                                ${expense.amount}
                                            </Text>
                                            {expense.category && (
                                                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                                                    {expense.category}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Card.Content>
                                <Text variant="bodyMedium">No expenses yet. Add your first expense!</Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>
            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('AddExpense')}
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
    balanceCard: {
        margin: spacing.md,
        marginBottom: spacing.sm,
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    actionButton: {
        flex: 1,
    },
    section: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    groupCard: {
        marginBottom: spacing.sm,
    },
    expenseCard: {
        marginBottom: spacing.sm,
    },
    expenseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    emptyCard: {
        padding: spacing.md,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
