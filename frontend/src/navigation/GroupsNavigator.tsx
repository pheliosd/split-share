import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GroupListScreen } from '@screens/groups/GroupListScreen';
import { GroupDetailScreen } from '@screens/groups/GroupDetailScreen';
import { CreateGroupScreen } from '@screens/groups/CreateGroupScreen';
import { AddExpenseScreen } from '@screens/expenses/AddExpenseScreen';
import { ExpenseDetailScreen } from '@screens/expenses/ExpenseDetailScreen';
import { BalancesScreen } from '@screens/settlements/BalancesScreen';
import { SettleUpScreen } from '@screens/settlements/SettleUpScreen';
import type { GroupsStackParamList } from '@types';

const Stack = createStackNavigator<GroupsStackParamList>();

export const GroupsNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="GroupList"
                component={GroupListScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="GroupDetail"
                component={GroupDetailScreen}
                options={({ route }: any) => ({ title: route.params?.groupName || 'Group' })}
            />
            <Stack.Screen
                name="CreateGroup"
                component={CreateGroupScreen}
                options={{ title: 'Create Group' }}
            />
            <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{ title: 'Add Expense', presentation: 'modal' }}
            />
            <Stack.Screen
                name="ExpenseDetail"
                component={ExpenseDetailScreen}
                options={{ title: 'Expense Details' }}
            />
            <Stack.Screen
                name="Balances"
                component={BalancesScreen}
                options={{ title: 'Balances & Settlements' }}
            />
            <Stack.Screen
                name="SettleUp"
                component={SettleUpScreen}
                options={{ title: 'Settle Up', presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
};
