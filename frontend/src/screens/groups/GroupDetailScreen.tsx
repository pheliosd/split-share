import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, FAB, Chip } from 'react-native-paper';
import { useGetGroupQuery, useGetGroupBalancesQuery } from '@api/groupsApi';
import { useGetExpensesQuery } from '@api/expensesApi';
import { spacing } from '@theme';
import { format } from 'date-fns';

export const GroupDetailScreen = ({ navigation, route }: any) => {
    const { groupId } = route.params;
    const theme = useTheme();

    const { data: groupData, isLoading: groupLoading, refetch: refetchGroup } = useGetGroupQuery(groupId);
    const { data: balancesData, isLoading: balancesLoading, refetch: refetchBalances } = useGetGroupBalancesQuery(groupId);
    const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useGetExpensesQuery({
        groupId,
        limit: 20,
    });

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchGroup(), refetchBalances(), refetchExpenses()]);
        setRefreshing(false);
    };

    if (groupLoading || balancesLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const group = groupData?.group;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Group Info */}
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text variant="headlineMedium">{group?.name}</Text>
                        {group?.description && (
                            <Text variant="bodyMedium" style={{ marginTop: spacing.sm, color: theme.colors.onSurfaceVariant }}>
                                {group.description}
                            </Text>
                        )}
                        <View style={styles.metaRow}>
                            <Chip icon="account-group">{group?._count?.members || 0} members</Chip>
                            <Chip icon="currency-usd">{group?.currency || 'USD'}</Chip>
                            <Chip>{group?.type || 'other'}</Chip>
                        </View>
                    </Card.Content>
                </Card>

                {/* Balances */}
                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Balances</Text>
                    {balancesData?.balances && balancesData.balances.length > 0 ? (
                        balancesData.balances.map((balance: any, index: number) => (
                            <Card key={index} style={styles.balanceCard}>
                                <Card.Content>
                                    <View style={styles.balanceRow}>
                                        <Text variant="titleMedium">{balance.userName}</Text>
                                        <Text
                                            variant="titleMedium"
                                            style={{
                                                color: parseFloat(balance.balance) >= 0 ? theme.colors.primary : theme.colors.error,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            ${Math.abs(parseFloat(balance.balance)).toFixed(2)}
                                        </Text>
                                    </View>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        {parseFloat(balance.balance) >= 0 ? 'is owed' : 'owes'}
                                    </Text>
                                </Card.Content>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Card.Content>
                                <Text variant="bodyMedium">All settled up!</Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>

                {/* Expenses */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleLarge">Expenses</Text>
                        <Button
                            onPress={() => navigation.navigate('AddExpense', { groupId })}
                            icon="plus"
                        >
                            Add
                        </Button>
                    </View>

                    {expensesData?.expenses && expensesData.expenses.length > 0 ? (
                        expensesData.expenses.map((expense: any) => (
                            <Card key={expense.id} style={styles.expenseCard}>
                                <Card.Content>
                                    <View style={styles.expenseRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="titleMedium">{expense.description}</Text>
                                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                {format(new Date(expense.date), 'MMM dd, yyyy')}
                                            </Text>
                                            {expense.payer && (
                                                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                                                    Paid by {expense.payer.name}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                                ${expense.amount}
                                            </Text>
                                            {expense.category && (
                                                <Chip style={{ marginTop: 4 }}>{expense.category}</Chip>
                                            )}
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Card.Content>
                                <Text variant="bodyMedium">No expenses yet</Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>
            </ScrollView>

            <FAB
                icon="plus"
                label="Add Expense"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('AddExpense', { groupId })}
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
    infoCard: {
        margin: spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
        flexWrap: 'wrap',
    },
    section: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
    },
    sectionTitle: {
        marginBottom: spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    balanceCard: {
        marginBottom: spacing.sm,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
