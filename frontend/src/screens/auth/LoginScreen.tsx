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
    ActivityIndicator,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin Mutation } from '@api/authApi';
import { useAppDispatch } from '@hooks/redux';
import { setCredentials } from '@store/slices/authSlice';
import { spacing, typography } from '@theme'; import type { LoginFormData } from '@types';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [login, { isLoading }] = useLoginMutation();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setError('');
            const result = await login(data).unwrap();
            dispatch(setCredentials(result));
        } catch (err: any) {
            setError(err?.data?.error?.message || 'Failed to login');
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
                        Welcome Back
                    </Text>
                    <Text style={[typography.body1, { color: theme.colors.onSurfaceVariant }]}>
                        Sign in to continue
                    </Text>
                </View>

                <View style={styles.form}>
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
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                label="Password"
                                placeholder="Enter your password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={!!errors.password}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="password"
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
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.submitButton}
                        contentStyle={styles.submitButtonContent}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <View style={styles.footer}>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Register')}
                        >
                            Don't have an account? Sign Up
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
