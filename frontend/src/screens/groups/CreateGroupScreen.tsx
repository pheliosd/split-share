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
    SegmentedButtons,
    Chip,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateGroupMutation } from '@api/groupsApi';
import { spacing, typography } from '@theme';

const createGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required').max(255),
    description: z.string().max(1000).optional(),
    type: z.enum(['trip', 'home', 'couple', 'office', 'other']),
    currency: z.string().length(3),
    memberIds: z.array(z.string()).min(1, 'Add at least one member'),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

const GROUP_TYPES = [
    { value: 'trip', label: 'Trip' },
    { value: 'home', label: 'Home' },
    { value: 'couple', label: 'Couple' },
    { value: 'office', label: 'Office' },
    { value: 'other', label: 'Other' },
];

export const CreateGroupScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const [createGroup, { isLoading }] = useCreateGroupMutation();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CreateGroupForm>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: '',
            description: '',
            type: 'other',
            currency: 'USD',
            memberIds: [],
        },
    });

    const selectedType = watch('type');

    const onSubmit = async (data: CreateGroupForm) => {
        try {
            setError('');
            await createGroup(data).unwrap();
            setSuccess(true);
            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        } catch (err: any) {
            setError(err?.data?.error?.message || 'Failed to create group');
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
                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Group Name *"
                                placeholder="e.g., Vegas Trip 2024"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={!!errors.name}
                                style={styles.input}
                            />
                        )}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Description"
                                placeholder="What's this group for?"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                            />
                        )}
                    />

                    <Text variant="titleMedium" style={styles.label}>
                        Group Type
                    </Text>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.typeContainer}>
                                {GROUP_TYPES.map((type) => (
                                    <Chip
                                        key={type.value}
                                        selected={value === type.value}
                                        onPress={() => onChange(type.value)}
                                        style={styles.typeChip}
                                    >
                                        {type.label}
                                    </Chip>
                                ))}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="currency"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Currency *"
                                placeholder="USD"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={!!errors.currency}
                                maxLength={3}
                                autoCapitalize="characters"
                                style={styles.input}
                            />
                        )}
                    />
                    {errors.currency && <Text style={styles.errorText}>{errors.currency.message}</Text>}

                    <Text variant="titleMedium" style={styles.label}>
                        Members
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.md }}>
                        Add members by searching for users (feature coming soon)
                    </Text>

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.submitButton}
                    >
                        {isLoading ? 'Creating Group...' : 'Create Group'}
                    </Button>
                </View>
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
                Group created successfully!
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
    form: {
        width: '100%',
    },
    input: {
        marginBottom: spacing.sm,
    },
    label: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    typeChip: {
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
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
