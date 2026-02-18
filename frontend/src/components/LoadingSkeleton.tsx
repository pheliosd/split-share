import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';

interface SkeletonBoxProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: object;
}

const SkeletonBox: React.FC<SkeletonBoxProps> = ({
    width = '100%',
    height = 16,
    borderRadius = 8,
    style,
}) => {
    const theme = useTheme();
    const opacity = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.colors.surfaceVariant,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const ListItemSkeleton: React.FC = () => (
    <View style={styles.listItem}>
        <SkeletonBox width={44} height={44} borderRadius={22} />
        <View style={styles.listItemContent}>
            <SkeletonBox width="60%" height={14} style={{ marginBottom: 8 }} />
            <SkeletonBox width="40%" height={12} />
        </View>
        <SkeletonBox width={60} height={14} />
    </View>
);

export const CardSkeleton: React.FC = () => (
    <View style={styles.card}>
        <SkeletonBox height={20} width="50%" style={{ marginBottom: 12 }} />
        <SkeletonBox height={14} style={{ marginBottom: 8 }} />
        <SkeletonBox height={14} width="80%" style={{ marginBottom: 8 }} />
        <SkeletonBox height={14} width="60%" />
    </View>
);

export const LoadingList: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <View>
        {Array.from({ length: count }).map((_, i) => (
            <ListItemSkeleton key={i} />
        ))}
    </View>
);

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    listItemContent: {
        flex: 1,
    },
    card: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
});
