import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@hooks/redux';

// Auth Screens
import { LoginScreen } from '@screens/auth/LoginScreen';
import { RegisterScreen } from '@screens/auth/RegisterScreen';

// Main Screens
import { HomeNavigator } from './HomeNavigator';
import { GroupsNavigator } from './GroupsNavigator';
import { ActivityScreen } from '@screens/activity/ActivityScreen';
import { AnalyticsScreen } from '@screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import { AddExpenseScreen } from '@screens/expenses/AddExpenseScreen';

import type {
    RootStackParamList,
    AuthStackParamList,
    MainTabsParamList,
} from '@types';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

// Auth Navigator
const AuthNavigator = () => {
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
};

// Main Tabs Navigator
const MainNavigator = () => {
    const theme = useTheme();

    return (
        <MainTabs.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'home';

                    switch (route.name) {
                        case 'Home':
                            iconName = 'home';
                            break;
                        case 'Groups':
                            iconName = 'account-group';
                            break;
                        case 'Activity':
                            iconName = 'timeline-text';
                            break;
                        case 'Analytics':
                            iconName = 'chart-bar';
                            break;
                        case 'Profile':
                            iconName = 'account';
                            break;
                    }

                    return (
                        <Icon
                            name={focused ? iconName : `${iconName}-outline`}
                            size={size}
                            color={color}
                        />
                    );
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                headerShown: true,
            })}
        >
            <MainTabs.Screen
                name="Home"
                component={HomeNavigator}
                options={{ title: 'Dashboard', headerShown: false }}
            />
            <MainTabs.Screen
                name="Groups"
                component={GroupsNavigator}
                options={{ title: 'Groups', headerShown: false }}
            />
            <MainTabs.Screen
                name="Activity"
                component={ActivityScreen}
                options={{ title: 'Activity' }}
            />
            <MainTabs.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{ title: 'Analytics' }}
            />
            <MainTabs.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </MainTabs.Navigator>
    );
};

// Root Navigator
export const AppNavigator = () => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <RootStack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};
