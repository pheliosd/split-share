import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    useTheme,
    Snackbar,
    Chip,
    SegmentedButtons,
    RadioButton,
    Checkbox,
    Card,
    Divider,
    ActivityIndicator,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetExpenseQuery, useUpdateExpenseMutation } from '@api/expensesApi';
import { useGetGroupsQuery } from '@api/groupsApi';
import { spacing } from '@theme';

const CATEGORIES = [
    { label: '🍔 Food', value: 'food' },
    { label: '🚗 Transport', value: 'transport' },
    { label: '🎬 Fun', value: 'entertainment' },
    { label: '💡 Utilities', value: 'utilities' },
    { label: '🛍️ Shopping', value: 'shopping' },
    { label: '📦 Other', value: 'other' },
];

const SPLIT_TYPES = [
    { value: 'equal', label: 'Equal' },
    { value: 'exact', label: 'Exact' },
    { value: 'percentage', label: '%' },
    { value: 'shares', label: 'Shares' },
];

const schema = z.object({
    description: z.string().min(1, 'Description required').max(255),
    amount: z.number().min(0.01, 'Amount must be positive'),
    currency: z.string().length(3),
    category: z.string().optional(),
    notes: z.string().optional(),
    payerId: z.string().min(1, 'Select who paid'),
    splitType: z.enum(['equal', 'exact', 'percentage', 'shares']),
});

type FormData = z.infer<typeof schema>;

export const EditExpenseScreen = ({ navigation, route }: any) => {
    const { expenseId } = route.params;
    const theme = useTheme();

    const { data, isLoading: loadingExpense } = useGetExpenseQuery(expenseId);
    const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();
    const { data: groupsData } = useGetGroupsQuery();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Member selection & split values (mirroring AddExpenseScreen)
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [splitValues, setSplitValues] = useState<Record<string, string>>({});

    const expense = data?.expense;

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            description: '',
            amount: 0,
            currency: 'USD',
            category: 'other',
            notes: '',
            payerId: '',
            splitType: 'equal',
        },
    });

    // Pre-populate form once expense data loads
    useEffect(() => {
        if (expense && !initialized) {
            reset({
                description: expense.description || '',
                amount: parseFloat(expense.amount) || 0,
                currency: expense.currency || 'USD',
                category: expense.category || 'other',
                notes: expense.notes || '',
                payerId: expense.payerId || '',
                splitType: expense.splitType || 'equal',
            });

            // Pre-populate splits
            if (expense.splits && expense.splits.length > 0) {
                const memberIds = expense.splits.map((s: any) => s.userId);
                setSelectedMembers(memberIds);

                const vals: Record<string, string> = {};
                expense.splits.forEach((s: any) => {
                    if (expense.splitType === 'exact') vals[s.userId] = s.amount?.toString() || '';
                    else if (expense.splitType === 'percentage') vals[s.userId] = s.percentage?.toString() || '';
                    else if (expense.splitType === 'shares') vals[s.userId] = s.shares?.toString() || '';
                });
                setSplitValues(vals);
            }

            setInitialized(true);
        }
    }, [expense, initialized, reset]);

    const splitType = watch('splitType');
    const amount = watch('amount');

    // Get group members from the expense's group
    const groupMembers = React.useMemo(() => {
        if (!groupsData?.groups || !expense?.groupId) return [];
        const group = groupsData.groups.find((g: any) => g.id === expense.groupId);
        return group?.members || [];
    }, [groupsData, expense?.groupId]);

    const toggleMember = useCallback((userId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    }, []);

    // Real-time split preview
    const splitPreview = React.useMemo(() => {
        if (!amount || selectedMembers.length === 0) return {};
        const preview: Record<string, number> = {};

        if (splitType === 'equal') {
            const share = amount / selectedMembers.length;
            selectedMembers.forEach((id) => { preview[id] = share; });
        } else if (splitType === 'exact') {
            selectedMembers.forEach((id) => {
                preview[id] = parseFloat(splitValues[id] || '0');
            });
        } else if (splitType === 'percentage') {
            selectedMembers.forEach((id) => {
                preview[id] = (amount * parseFloat(splitValues[id] || '0')) / 100;
            });
        } else if (splitType === 'shares') {
            const totalShares = selectedMembers.reduce(
                (sum, id) => sum + parseFloat(splitValues[id] || '1'), 0
            );
            selectedMembers.forEach((id) => {
                preview[id] = (amount * parseFloat(splitValues[id] || '1')) / totalShares;
            });
        }
        return preview;
    }, [amount, splitType, selectedMembers, splitValues]);

    // Validation
    const splitValidationError = React.useMemo(() => {
        if (splitType === 'equal' || !amount) return '';
        if (splitType === 'percentage') {
            const pctSum = selectedMembers.reduce(
                (s, id) => s + parseFloat(splitValues[id] || '0'), 0
            );
            if (Math.abs(pctSum - 100) > 0.01)
                return `Percentages must sum to 100% (currently ${pctSum.toFixed(1)}%)`;
        } else if (splitType === 'exact') {
            const total = Object.values(splitPreview).reduce((a, b) => a + b, 0);
            if (Math.abs(total - amount) > 0.01)
                return `Amounts must sum to $${amount.toFixed(2)} (currently $${total.toFixed(2)})`;
        }
        return '';
    }, [splitType, splitPreview, amount, selectedMembers, splitValues]);

    const buildSplits = () =>
        selectedMembers.map((userId) => {
            if (splitType === 'equal') return { userId };
            if (splitType === 'exact') return { userId, amount: parseFloat(splitValues[userId] || '0') };
            if (splitType === 'percentage') return { userId, percentage: parseFloat(splitValues[userId] || '0') };
            return { userId, shares: parseFloat(splitValues[userId] || '1') };
        });

    const onSubmit = async (data: FormData) => {
        if (selectedMembers.length === 0) {
            setError('Select at least one member to split with');
            return;
        }
        if (splitValidationError) {
            setError(splitValidationError);
            return;
        }
        try {
            setError('');
            await updateExpense({
                expenseId,
                data: { ...data, splits: buildSplits() },
            }).unwrap();
            setSuccess(true);
            setTimeout(() => navigation.goBack(), 1500);
        } catch (err: any) {
            setError(err?.data?.error?.message || 'Failed to update expense');
        }
    };

    if (loadingExpense || !initialized) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
                <Text variant="bodyMedium" style={{ marginTop: spacing.md }}>
                    Loading expense...
                </Text>
            </View>
        );
    }

    if (!expense) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyLarge">Expense not found</Text>
                <Button onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
                    Go Back
                </Button>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Description */}
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            mode="outlined"
                            label="Description *"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={!!errors.description}
                            style={styles.input}
                        />
                    )}
                />
                {errors.description && (
                    <Text style={styles.errorText}>{errors.description.message}</Text>
                )}

                {/* Amount */}
                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            mode="outlined"
                            label="Amount *"
                            value={value?.toString() || ''}
                            onChangeText={(text) => onChange(parseFloat(text) || 0)}
                            onBlur={onBlur}
                            error={!!errors.amount}
                            keyboardType="decimal-pad"
                            left={<TextInput.Affix text="$" />}
                            style={styles.input}
                        />
                    )}
                />
                {errors.amount && (
                    <Text style={styles.errorText}>{errors.amount.message}</Text>
                )}

                {/* Category */}
                <Text variant="titleMedium" style={styles.label}>Category</Text>
                <Controller
                    control={control}
                    name="category"
                    render={({ field: { value, onChange } }) => (
                        <View style={styles.chipContainer}>
                            {CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat.value}
                                    selected={value === cat.value}
                                    onPress={() => onChange(cat.value)}
                                    style={styles.chip}
                                    compact
                                >
                                    {cat.label}
                                </Chip>
                            ))}
                        </View>
                    )}
                />

                <Divider style={styles.divider} />

                {/* Who Paid */}
                <Controller
                    control={control}
                    name="payerId"
                    render={({ field: { value, onChange } }) => (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.label}>Who paid? *</Text>
                            <RadioButton.Group onValueChange={onChange} value={value}>
                                {groupMembers.map((member: any) => (
                                    <RadioButton.Item
                                        key={member.userId}
                                        label={member.user?.name || 'Unknown'}
                                        value={member.userId}
                                    />
                                ))}
                            </RadioButton.Group>
                            {errors.payerId && (
                                <Text style={styles.errorText}>{errors.payerId.message}</Text>
                            )}
                        </View>
                    )}
                />

                <Divider style={styles.divider} />

                {/* Split Type */}
                <Text variant="titleMedium" style={styles.label}>Split Type *</Text>
                <Controller
                    control={control}
                    name="splitType"
                    render={({ field: { value, onChange } }) => (
                        <SegmentedButtons
                            value={value}
                            onValueChange={onChange}
                            buttons={SPLIT_TYPES}
                            style={styles.segmented}
                        />
                    )}
                />

                {/* Member Split UI */}
                {groupMembers.length > 0 && (
                    <Card style={styles.splitCard}>
                        <Card.Content>
                            <Text variant="titleSmall" style={styles.label}>
                                {splitType === 'equal' && 'Split equally among:'}
                                {splitType === 'exact' && 'Enter exact amounts:'}
                                {splitType === 'percentage' && 'Enter percentages (must total 100%):'}
                                {splitType === 'shares' && 'Enter shares (ratio-based):'}
                            </Text>

                            {groupMembers.map((member: any) => {
                                const userId = member.userId;
                                const isSelected = selectedMembers.includes(userId);
                                const preview = splitPreview[userId];

                                return (
                                    <View key={userId} style={styles.memberRow}>
                                        <Checkbox
                                            status={isSelected ? 'checked' : 'unchecked'}
                                            onPress={() => toggleMember(userId)}
                                        />
                                        <Text
                                            variant="bodyMedium"
                                            style={[styles.memberName, !isSelected && { opacity: 0.4 }]}
                                        >
                                            {member.user?.name || 'Unknown'}
                                        </Text>

                                        {isSelected && splitType !== 'equal' && (
                                            <TextInput
                                                mode="outlined"
                                                dense
                                                value={splitValues[userId] || ''}
                                                onChangeText={(v) =>
                                                    setSplitValues((prev) => ({ ...prev, [userId]: v }))
                                                }
                                                keyboardType="decimal-pad"
                                                right={
                                                    splitType === 'percentage'
                                                        ? <TextInput.Affix text="%" />
                                                        : splitType === 'shares'
                                                            ? <TextInput.Affix text="sh" />
                                                            : <TextInput.Affix text="$" />
                                                }
                                                style={styles.splitInput}
                                                placeholder={splitType === 'shares' ? '1' : '0'}
                                            />
                                        )}

                                        {isSelected && preview !== undefined && (
                                            <Text
                                                variant="bodySmall"
                                                style={[styles.previewAmount, { color: theme.colors.primary }]}
                                            >
                                                ${preview.toFixed(2)}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}

                            {splitValidationError ? (
                                <Text style={[styles.errorText, { marginTop: spacing.sm }]}>
                                    ⚠️ {splitValidationError}
                                </Text>
                            ) : splitType === 'equal' && selectedMembers.length > 0 && amount > 0 ? (
                                <Text
                                    variant="bodySmall"
                                    style={{ color: theme.colors.primary, marginTop: spacing.sm }}
                                >
                                    ${(amount / selectedMembers.length).toFixed(2)} each
                                </Text>
                            ) : null}
                        </Card.Content>
                    </Card>
                )}

                {/* Notes */}
                <Controller
                    control={control}
                    name="notes"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            mode="outlined"
                            label="Notes (optional)"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            multiline
                            numberOfLines={2}
                            style={styles.input}
                        />
                    )}
                />

                <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    loading={updating}
                    disabled={updating || !!splitValidationError}
                    style={styles.submitButton}
                    icon="content-save"
                >
                    {updating ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: spacing.sm }}
                >
                    Cancel
                </Button>
            </ScrollView>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError('')}
                duration={4000}
                action={{ label: 'OK', onPress: () => setError('') }}
            >
                {error}
            </Snackbar>
            <Snackbar visible={success} onDismiss={() => setSuccess(false)} duration={1500}>
                ✅ Expense updated!
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
    section: { marginBottom: spacing.md },
    input: { marginBottom: spacing.sm },
    label: { marginTop: spacing.sm, marginBottom: spacing.sm, fontWeight: '600' },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    chip: { marginRight: spacing.xs, marginBottom: spacing.xs },
    segmented: { marginBottom: spacing.md },
    divider: { marginVertical: spacing.md },
    splitCard: { marginBottom: spacing.md },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    memberName: { flex: 1 },
    splitInput: { width: 100 },
    previewAmount: { minWidth: 60, textAlign: 'right', fontWeight: '600' },
    errorText: { color: '#F44336', fontSize: 12, marginBottom: spacing.sm },
    submitButton: { marginTop: spacing.lg },
});
