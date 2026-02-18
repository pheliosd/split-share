import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '@screens/home/DashboardScreen';
import { AddExpenseScreen } from '@screens/expenses/AddExpenseScreen';
import type { HomeStackParamList } from '@types';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{ title: 'Add Expense', presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
};
