import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'inbox-outline',
    title,
    description,
    actionLabel,
    onAction,
}) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <Icon
                name={icon}
                size={64}
                color={theme.colors.onSurfaceVariant}
                style={styles.icon}
            />
            <Text
                variant="titleMedium"
                style={[styles.title, { color: theme.colors.onSurface }]}
            >
                {title}
            </Text>
            {description && (
                <Text
                    variant="bodyMedium"
                    style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
                >
                    {description}
                </Text>
            )}
            {actionLabel && onAction && (
                <Button
                    mode="contained"
                    onPress={onAction}
                    style={styles.button}
                >
                    {actionLabel}
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    icon: {
        marginBottom: 16,
        opacity: 0.6,
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        marginTop: 8,
    },
});
