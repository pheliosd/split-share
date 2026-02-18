import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    message = 'Something went wrong. Please try again.',
    onRetry,
}) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <Icon
                name="alert-circle-outline"
                size={56}
                color={theme.colors.error}
                style={styles.icon}
            />
            <Text
                variant="titleMedium"
                style={[styles.title, { color: theme.colors.onSurface }]}
            >
                Oops!
            </Text>
            <Text
                variant="bodyMedium"
                style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
            >
                {message}
            </Text>
            {onRetry && (
                <Button
                    mode="outlined"
                    onPress={onRetry}
                    icon="refresh"
                    style={styles.button}
                >
                    Try Again
                </Button>
            )}
        </View>
    );
};

class ErrorBoundaryInner extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <ErrorState
                        message={this.state.error?.message || 'An unexpected error occurred.'}
                        onRetry={() => this.setState({ hasError: false })}
                    />
                )
            );
        }
        return this.props.children;
    }
}

export const ErrorBoundary = ErrorBoundaryInner;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        marginTop: 8,
    },
});
