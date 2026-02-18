import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Custom brand colors
const colors = {
    primary: '#00BFA5',      // Teal
    secondary: '#FF6E40',    // Deep Orange
    tertiary: '#7C4DFF',     // Deep Purple
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
};

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: colors.primary,
        secondary: colors.secondary,
        tertiary: colors.tertiary,
        error: colors.error,
        success: colors.success,
        warning: colors.warning,
        info: colors.info,
    },
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: colors.primary,
        secondary: colors.secondary,
        tertiary: colors.tertiary,
        error: colors.error,
        success: colors.success,
        warning: colors.warning,
        info: colors.info,
    },
};

// Spacing system (8px grid)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Typography
export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
    },
    h2: {
        fontSize: 28,
        fontWeight: '600' as const,
        lineHeight: 36,
    },
    h3: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
    },
    h4: {
        fontSize: 20,
        fontWeight: '500' as const,
        lineHeight: 28,
    },
    body1: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    body2: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
};

// Border radius
export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
};

// Shadows
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
};
