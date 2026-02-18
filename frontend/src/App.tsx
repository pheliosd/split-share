import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { store } from './store';
import { AppNavigator } from './navigation/AppNavigator';
import { lightTheme, darkTheme } from './theme';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import { setCredentials } from './store/slices/authSlice';

const AppContent = () => {
    const theme = useAppSelector((state) => state.ui.theme);
    const dispatch = useAppDispatch();

    // Check for saved tokens on app start
    useEffect(() => {
        const loadTokens = async () => {
            try {
                const [accessToken, refreshToken] = await AsyncStorage.multiGet([
                    'accessToken',
                    'refreshToken',
                ]);

                if (accessToken[1] && refreshToken[1]) {
                    // TODO: Validate tokens and fetch user data
                    // For now, we'll let the getCurrentUser query handle this
                }
            } catch (error) {
                console.error('Error loading tokens:', error);
            }
        };

        loadTokens();
    }, [dispatch]);

    const paperTheme = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <PaperProvider theme={paperTheme}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <StatusBar
                        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                        backgroundColor={paperTheme.colors.background}
                    />
                    <AppNavigator />
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </PaperProvider>
    );
};

const App = () => {
    return (
        <ReduxProvider store={store}>
            <AppContent />
        </ReduxProvider>
    );
};

export default App;
