import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                user: User;
                accessToken: string;
                refreshToken: string;
            }>
        ) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;

            // Save tokens to AsyncStorage
            AsyncStorage.setItem('accessToken', action.payload.accessToken);
            AsyncStorage.setItem('refreshToken', action.payload.refreshToken);
        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;

            // Clear AsyncStorage
            AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        },

        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setCredentials,
    logout,
    updateUser,
    setLoading,
    setError,
} = authSlice.actions;

export default authSlice.reducer;
