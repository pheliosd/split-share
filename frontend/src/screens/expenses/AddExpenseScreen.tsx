import React, { useState } from 'react';
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
} from 'react-native-paper';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateExpenseMutation } from '@api/expensesApi';
import { useGetGroupsQuery } from '@api/groupsApi';
import { spacing } from '@theme';
import type { ExpenseFormData } from '@types';

const CATEGORIES = [
    'food', 'transport', 'entertainment', 'utilities', 'shopping', 'other'
];

const SPLIT_TYPES = [
    { value: 'equal', label: 'Equal' },
    { value: 'exact', label: 'Exact' },
    { value: 'percentage', label: '%' },
    { value: 'shares', label: 'Shares' },
];

const createExpenseSchema = z.object({
    groupId: z.string().min(1, 'Select a group'),
    description: z.string().min(1, 'Description required').max(255),
    amount: z.number().min(0.01, 'Amount must be positive'),
    currency: z.string().length(3),
    date: z.date(),
    category: z.string().optional(),
    notes: z.string().optional(),
    payerId: z.string().min(1, 'Select who paid'),
    splitType: z.enum(['equal', 'exact', 'percentage', 'shares']),
    splits: z.array(z.object({
        userId: z.string(),
        amount: z.number().optional(),
        percentage: z.number().optional(),
        shares: z.number().optional(),
    })).min(1),
});

export const AddExpenseScreen = ({ navigation, route }: any) => {
    const theme = useTheme();
    const [createExpense, { isLoading }] = useCreateExpenseMutation();
    const { data: groupsData } = useGetGroupsQuery();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(createExpenseSchema),
        defaultValues: {
            groupId: route.params?.groupId || '',
            description: '',
            amount: 0,
            currency: 'USD',
            date: new Date(),
            category: 'other',
            notes: '',
            payerId: '',
            splitType: 'equal',
            splits: [],
        },
    });

    const splitType = watch('splitType');
    const selectedGroupId = watch('groupId');
    const amount = watch('amount');

    // Get members from selected group
    const groupMembers = React.useMemo(() => {
        if (!groupsData?.groups || !selectedGroupId) return [];
        const group = groupsData.groups.find((g: any) => g.id === selectedGroupId);
        return group?.members || [];
    }, [groupsData, selectedGroupId]);

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            setError('');
            await createExpense({
                ...data,
                date: data.date.toISOString(),
            }).unwrap();
            setSuccess(true);
            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        } catch (err: any) {
            setError(err?.data?.error?.message || 'Failed to create expense');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Group Selection */}
                <Controller
                    control={control}
                    name="groupId"
                    render={({ field: { value, onChange } }) => (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.label}>Group *</Text>
                            <RadioButton.Group onValueChange={onChange} value={value}>
                                {groupsData?.groups?.map((group: any) => (
                                    <RadioButton.Item
                                        key={group.id}
                                        label={group.name}
                                        value={group.id}
                                    />
                                ))}
                            </RadioButton.Group>
                            {errors.groupId && <Text style={styles.errorText}>{errors.groupId.message}</Text>}
                        </View>
                    )}
                />

                {/* Description */}
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            mode="outlined"
                            label="Description *"
                            placeholder="What's this expense for?"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={!!errors.description}
                            style={styles.input}
                        />
                    )}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

                {/* Amount */}
                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            mode="outlined"
                            label="Amount *"
                            placeholder="0.00"
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
                {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

                {/* Category */}
                <Text variant="titleMedium" style={styles.label}>Category</Text>
                <Controller
                    control={control}
                    name="category"
                    render={({ field: { value, onChange } }) => (
                        <View style={styles.chipContainer}>
                            {CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat}
                                    selected={value === cat}
                                    onPress={() => onChange(cat)}
                                    style={styles.chip}
                                >
                                    {cat}
                                </Chip>
                            ))}
                        </View>
                    )}
                />

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
                            {errors.payerId && <Text style={styles.errorText}>{errors.payerId.message}</Text>}
                        </View>
                    )}
                />

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

                {/* Split Details - shown based on type */}
                <View style={styles.section}>
                    <Text variant="titleSmall" style={styles.label}>
                        {splitType === 'equal' && 'Split equally among:'}
                        {splitType === 'exact' && 'Enter exact amounts:'}
                        {splitType === 'percentage' && 'Enter percentages:'}
                        {splitType === 'shares' && 'Enter shares:'}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Select members who will split this expense
                    </Text>
                </View>

                {/* Notes */}
                <Controller
                    control={control}
                    name="notes"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            mode="outlined"
                            label="Notes (optional)"
                            placeholder="Add any notes..."
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                    )}
                />

                <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitButton}
                >
                    {isLoading ? 'Creating...' : 'Create Expense'}
                </Button>
            </ScrollView>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError('')}
                duration={3000}
                action={{ label: 'Dismiss', onPress: () => setError('') }}
            >
                {error}
            </Snackbar>

            <Snackbar
                visible={success}
                onDismiss={() => setSuccess(false)}
                duration={1500}
            >
                Expense created successfully!
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.md,
    },
    input: {
        marginBottom: spacing.sm,
    },
    label: {
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    chip: {
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    segmented: {
        marginBottom: spacing.md,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginBottom: spacing.sm,
        marginLeft: spacing.sm,
    },
    submitButton: {
        marginTop: spacing.xl,
    },
});
