import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Dimensions,
} from 'react-native';
import {
    Text,
    Card,
    useTheme,
    ActivityIndicator,
    SegmentedButtons,
    Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    useGetSpendingByCategoryQuery,
    useGetSpendingOverTimeQuery,
    useGetUserSummaryQuery,
    useGetTopExpensesQuery,
} from '@api/analyticsApi';
import { spacing } from '@theme';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    entertainment: '#45B7D1',
    utilities: '#96CEB4',
    shopping: '#FFEAA7',
    other: '#DDA0DD',
};

const PERIOD_OPTIONS = [
    { value: 'month', label: 'Monthly' },
    { value: 'day', label: 'Daily' },
];

const StatCard = ({
    icon,
    label,
    value,
    color,
}: {
    icon: string;
    label: string;
    value: string;
    color: string;
}) => {
    const theme = useTheme();
    return (
        <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                    <Icon name={icon} size={24} color={color} />
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                    {label}
                </Text>
                <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 4 }}>
                    {value}
                </Text>
            </Card.Content>
        </Card>
    );
};

// Simple bar chart without external library
const SimpleBarChart = ({ data }: { data: { period: string; amount: string }[] }) => {
    const theme = useTheme();
    if (!data.length) return null;

    const maxAmount = Math.max(...data.map((d) => parseFloat(d.amount)));
    const barWidth = Math.max(20, (width - 80) / data.length - 8);

    return (
        <View style={styles.chartContainer}>
            <View style={styles.barsRow}>
                {data.slice(-8).map((item, index) => {
                    const height = maxAmount > 0
                        ? Math.max(4, (parseFloat(item.amount) / maxAmount) * 120)
                        : 4;
                    return (
                        <View key={index} style={styles.barWrapper}>
                            <Text variant="labelSmall" style={styles.barValue}>
                                ${parseFloat(item.amount).toFixed(0)}
                            </Text>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height,
                                        width: barWidth,
                                        backgroundColor: theme.colors.primary,
                                    },
                                ]}
                            />
                            <Text variant="labelSmall" style={styles.barLabel} numberOfLines={1}>
                                {item.period.slice(-5)}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// Simple pie-like category breakdown
const CategoryBreakdown = ({
    data,
}: {
    data: { category: string; amount: string; percentage: string }[];
}) => {
    const theme = useTheme();
    return (
        <View>
            {data.map((item, index) => {
                const color = CATEGORY_COLORS[item.category] || '#999';
                const pct = parseFloat(item.percentage);
                return (
                    <View key={index} style={styles.categoryRow}>
                        <View style={[styles.categoryDot, { backgroundColor: color }]} />
                        <Text variant="bodyMedium" style={{ flex: 1, textTransform: 'capitalize' }}>
                            {item.category}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {item.percentage}%
                        </Text>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginLeft: 8 }}>
                            ${item.amount}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

export const AnalyticsScreen = () => {
    const theme = useTheme();
    const [groupBy, setGroupBy] = useState<'month' | 'day'>('month');
    const [refreshing, setRefreshing] = useState(false);

    const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } =
        useGetUserSummaryQuery();
    const { data: categoryData, isLoading: categoryLoading, refetch: refetchCategory } =
        useGetSpendingByCategoryQuery({});
    const { data: timeData, isLoading: timeLoading, refetch: refetchTime } =
        useGetSpendingOverTimeQuery({ groupBy });
    const { data: topData, isLoading: topLoading, refetch: refetchTop } =
        useGetTopExpensesQuery({ limit: 5 });

    const isLoading = summaryLoading && categoryLoading;

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchSummary(), refetchCategory(), refetchTime(), refetchTop()]);
        setRefreshing(false);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const summary = summaryData?.data;
    const categories = categoryData?.data || [];
    const timeSeries = timeData?.data || [];
    const topExpenses = topData?.data || [];

    const netBalance = parseFloat(summary?.netBalance || '0');

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Summary Stats */}
            <Text variant="titleLarge" style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
                <StatCard
                    icon="cash-plus"
                    label="Total Paid"
                    value={`$${summary?.totalPaid || '0.00'}`}
                    color="#4CAF50"
                />
                <StatCard
                    icon="cash-minus"
                    label="Total Owed"
                    value={`$${summary?.totalOwed || '0.00'}`}
                    color="#F44336"
                />
                <StatCard
                    icon="scale-balance"
                    label="Net Balance"
                    value={`$${Math.abs(netBalance).toFixed(2)}`}
                    color={netBalance >= 0 ? '#4CAF50' : '#F44336'}
                />
                <StatCard
                    icon="receipt-text"
                    label="Expenses"
                    value={`${summary?.expenseCount || 0}`}
                    color={theme.colors.primary}
                />
            </View>

            {/* Spending Over Time */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Text variant="titleMedium">Spending Over Time</Text>
                        <SegmentedButtons
                            value={groupBy}
                            onValueChange={(v) => setGroupBy(v as 'month' | 'day')}
                            buttons={PERIOD_OPTIONS}
                            style={{ width: 180 }}
                        />
                    </View>
                    {timeLoading ? (
                        <ActivityIndicator style={{ marginVertical: spacing.lg }} />
                    ) : timeSeries.length > 0 ? (
                        <SimpleBarChart data={timeSeries} />
                    ) : (
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: spacing.lg }}>
                            No spending data yet
                        </Text>
                    )}
                </Card.Content>
            </Card>

            {/* Category Breakdown */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.cardTitle}>Spending by Category</Text>
                    {categoryLoading ? (
                        <ActivityIndicator style={{ marginVertical: spacing.lg }} />
                    ) : categories.length > 0 ? (
                        <CategoryBreakdown data={categories} />
                    ) : (
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: spacing.lg }}>
                            No category data yet
                        </Text>
                    )}
                </Card.Content>
            </Card>

            {/* Top Expenses */}
            <Card style={[styles.card, { marginBottom: spacing.xl }]}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.cardTitle}>Top Expenses</Text>
                    {topLoading ? (
                        <ActivityIndicator style={{ marginVertical: spacing.lg }} />
                    ) : topExpenses.length > 0 ? (
                        topExpenses.map((expense: any, index: number) => (
                            <View key={expense.id} style={styles.topExpenseRow}>
                                <View style={[styles.rankBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                                        #{index + 1}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: spacing.md }}>
                                    <Text variant="bodyMedium" numberOfLines={1}>{expense.description}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        {expense.group?.name} · {format(new Date(expense.date), 'MMM dd')}
                                    </Text>
                                </View>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                    ${expense.amount}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: spacing.lg }}>
                            No expenses yet
                        </Text>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { margin: spacing.md, fontWeight: 'bold' },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.sm,
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    statCard: { width: (width - spacing.sm * 3 - 32) / 2 },
    statContent: { alignItems: 'center', paddingVertical: spacing.md },
    statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    card: { marginHorizontal: spacing.md, marginBottom: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    cardTitle: { marginBottom: spacing.md },
    chartContainer: { paddingVertical: spacing.md },
    barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160 },
    barWrapper: { alignItems: 'center', justifyContent: 'flex-end' },
    bar: { borderRadius: 4 },
    barValue: { marginBottom: 4, fontSize: 9 },
    barLabel: { marginTop: 4, fontSize: 9, maxWidth: 40, textAlign: 'center' },
    categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
    topExpenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
    rankBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
