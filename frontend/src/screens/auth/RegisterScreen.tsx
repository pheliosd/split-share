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
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '@api/authApi';
import { useAppDispatch } from '@hooks/redux';
import { setCredentials } from '@store/slices/authSlice';
import { spacing, typography } from '@theme';
import type { RegisterFormData } from '@types';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const RegisterScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [register, { isLoading }] = useRegisterMutation();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setError('');
            const { confirmPassword, ...registerData } = data;
            const result = await register(registerData).unwrap();
            dispatch(setCredentials(result));
        } catch (err: any) {
            setError(err?.data?.error?.message || 'Failed to register');
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
                <View style={styles.header}>
                    <Text style={[typography.h1, { color: theme.colors.primary }]}>
                        Create Account
                    </Text>
                    <Text style={[typography.body1, { color: theme.colors.onSurfaceVariant }]}>
                        Join Splitwise today
                    </Text>
                </View>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Full Name"
                                placeholder="Enter your name"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={!!errors.name}
                                left={<TextInput.Icon icon="account" />}
                                style={styles.input}
                            />
                        )}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Email"
                                placeholder="Enter your email"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={!!errors.email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                left={<TextInput.Icon icon="email" />}
                                style={styles.input}
                            />
                        )}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Password"
                                placeholder="Create a password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={!!errors.password}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                left={<TextInput.Icon icon="lock" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                                style={styles.input}
                            />
                        )}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={!!errors.confirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                left={<TextInput.Icon icon="lock-check" />}
                                style={styles.input}
                            />
                        )}
                    />
                    {errors.confirmPassword && (
                        <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.submitButton}
                        contentStyle={styles.submitButtonContent}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>

                    <View style={styles.footer}>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Login')}
                        >
                            Already have an account? Sign In
                        </Button>
                    </View>
                </View>
            </ScrollView>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError('')}
                duration={3000}
                action={{
                    label: 'Dismiss',
                    onPress: () => setError(''),
                }}
            >
                {error}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: spacing.sm,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginBottom: spacing.sm,
        marginLeft: spacing.sm,
    },
    submitButton: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    submitButtonContent: {
        paddingVertical: spacing.sm,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
});
