import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GroupListScreen } from '@screens/groups/GroupListScreen';
import { GroupDetailScreen } from '@screens/groups/GroupDetailScreen';
import { CreateGroupScreen } from '@screens/groups/CreateGroupScreen';
import { AddExpenseScreen } from '@screens/expenses/AddExpenseScreen';
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
                options={{ title: 'Group Details' }}
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
        </Stack.Navigator>
    );
};
