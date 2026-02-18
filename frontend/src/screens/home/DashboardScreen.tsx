import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { useGetGroupsQuery } from '@api/groupsApi';
import { useGetExpensesQuery } from '@api/expensesApi';
import { spacing } from '@theme';
import { format } from 'date-fns';

export const DashboardScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = useGetGroupsQuery();
    const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useGetExpensesQuery({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const [refreshing, setRefreshing] = React.useState(false);

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
                {/* Balance Overview */}
                <Card style={styles.balanceCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Total Balance
                        </Text>
                        <Text
                            variant="displaySmall"
                            style={{
                                color: theme.colors.primary,
                                fontWeight: 'bold',
                            }}
                        >
                            $0.00
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            All settled up!
                        </Text>
                    </Card.Content>
                </Card>

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
