import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import {
    Text,
    Card,
    Button,
    useTheme,
    ActivityIndicator,
    Chip,
    Divider,
    IconButton,
    Menu,
    Snackbar,
    Avatar,
} from 'react-native-paper';
import { useGetExpenseQuery, useDeleteExpenseMutation } from '@api/expensesApi';
import { spacing } from '@theme';
import { format } from 'date-fns';

const CATEGORY_ICONS: Record<string, string> = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    shopping: '🛍️',
    other: '📦',
};

export const ExpenseDetailScreen = ({ navigation, route }: any) => {
    const { expenseId } = route.params;
    const theme = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const [snackbar, setSnackbar] = useState('');

    const { data, isLoading, isError, refetch } = useGetExpenseQuery(expenseId);
    const [deleteExpense, { isLoading: deleting }] = useDeleteExpenseMutation();

    const expense = data?.expense;

    const handleDelete = () => {
        Alert.alert(
            'Delete Expense',
            `Are you sure you want to delete "${expense?.description}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteExpense(expenseId).unwrap();
                            navigation.goBack();
                        } catch {
                            setSnackbar('Failed to delete expense');
                        }
                    },
                },
            ]
        );
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <IconButton
                            icon="dots-vertical"
                            onPress={() => setMenuVisible(true)}
                        />
                    }
                >
                    <Menu.Item
                        onPress={() => {
                            setMenuVisible(false);
                            navigation.navigate('EditExpense', { expenseId });
                        }}
                        title="Edit"
                        leadingIcon="pencil"
                    />
                    <Menu.Item
                        onPress={() => {
                            setMenuVisible(false);
                            handleDelete();
                        }}
                        title="Delete"
                        leadingIcon="trash-can"
                        titleStyle={{ color: theme.colors.error }}
                    />
                </Menu>
            ),
        });
    }, [navigation, menuVisible, expense]);

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isError || !expense) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyLarge">Expense not found</Text>
                <Button onPress={refetch} style={{ marginTop: spacing.md }}>Retry</Button>
            </View>
        );
    }

    const totalAmount = parseFloat(expense.amount);
    const emoji = CATEGORY_ICONS[expense.category] || '📦';

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Header Card */}
            <Card style={styles.headerCard}>
                <Card.Content style={styles.headerContent}>
                    <Text style={styles.emoji}>{emoji}</Text>
                    <Text variant="headlineMedium" style={styles.description}>
                        {expense.description}
                    </Text>
                    <Text
                        variant="displaySmall"
                        style={[styles.amount, { color: theme.colors.primary }]}
                    >
                        {expense.currency} {totalAmount.toFixed(2)}
                    </Text>
                    <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                    >
                        {format(new Date(expense.date), 'EEEE, MMMM d, yyyy')}
                    </Text>
                </Card.Content>
            </Card>

            {/* Details */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Details</Text>
                    <Divider style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Paid by
                        </Text>
                        <View style={styles.personRow}>
                            <Avatar.Text
                                size={24}
                                label={(expense.payer?.name || 'U').charAt(0).toUpperCase()}
                                style={{ backgroundColor: theme.colors.primaryContainer }}
                            />
                            <Text variant="bodyMedium" style={{ marginLeft: 8, fontWeight: '600' }}>
                                {expense.payer?.name || 'Unknown'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Category
                        </Text>
                        <Chip compact>{expense.category || 'other'}</Chip>
                    </View>

                    <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Split type
                        </Text>
                        <Chip compact icon="call-split">{expense.splitType}</Chip>
                    </View>

                    {expense.notes && (
                        <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                                Notes
                            </Text>
                            <Text variant="bodyMedium">{expense.notes}</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Splits */}
            {expense.splits && expense.splits.length > 0 && (
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Split Breakdown</Text>
                        <Divider style={styles.divider} />
                        {expense.splits.map((split: any, index: number) => {
                            const splitAmt = parseFloat(split.amount);
                            const pct = ((splitAmt / totalAmount) * 100).toFixed(0);
                            return (
                                <View key={index} style={styles.splitRow}>
                                    <View style={styles.personRow}>
                                        <Avatar.Text
                                            size={32}
                                            label={(split.user?.name || 'U').charAt(0).toUpperCase()}
                                            style={{ backgroundColor: theme.colors.secondaryContainer }}
                                        />
                                        <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                                            {split.user?.name || 'Unknown'}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                                            {expense.currency} {splitAmt.toFixed(2)}
                                        </Text>
                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                            {pct}%
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </Card.Content>
                </Card>
            )}

            {/* Comments */}
            {expense.comments && expense.comments.length > 0 && (
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Comments ({expense.comments.length})
                        </Text>
                        <Divider style={styles.divider} />
                        {expense.comments.map((comment: any, index: number) => (
                            <View key={index} style={styles.commentRow}>
                                <Avatar.Text
                                    size={28}
                                    label={(comment.user?.name || 'U').charAt(0).toUpperCase()}
                                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                                />
                                <View style={{ marginLeft: 8, flex: 1 }}>
                                    <Text variant="labelMedium" style={{ fontWeight: '600' }}>
                                        {comment.user?.name}
                                    </Text>
                                    <Text variant="bodySmall">{comment.comment}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </Card.Content>
                </Card>
            )}

            <Snackbar
                visible={!!snackbar}
                onDismiss={() => setSnackbar('')}
                duration={3000}
            >
                {snackbar}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    headerCard: { marginBottom: spacing.md },
    headerContent: { alignItems: 'center', paddingVertical: spacing.lg },
    emoji: { fontSize: 48, marginBottom: spacing.sm },
    description: { textAlign: 'center', fontWeight: 'bold' },
    amount: { fontWeight: 'bold', marginTop: spacing.sm },
    card: { marginBottom: spacing.md },
    sectionTitle: { fontWeight: 'bold', marginBottom: spacing.sm },
    divider: { marginBottom: spacing.md },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    personRow: { flexDirection: 'row', alignItems: 'center' },
    splitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    commentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
});
