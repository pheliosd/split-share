import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    theme: 'light' | 'dark';
    loading: Record<string, boolean>;
    errors: Record<string, string | null>;
}

const initialState: UIState = {
    theme: 'light',
    loading: {},
    errors: {},
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },

        setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
            state.loading[action.payload.key] = action.payload.value;
        },

        setError: (state, action: PayloadAction<{ key: string; value: string | null }>) => {
            state.errors[action.payload.key] = action.payload.value;
        },

        clearError: (state, action: PayloadAction<string>) => {
            delete state.errors[action.payload];
        },

        clearAllErrors: (state) => {
            state.errors = {};
        },
    },
});

export const {
    setTheme,
    setLoading,
    setError,
    clearError,
    clearAllErrors,
} = uiSlice.actions;

export default uiSlice.reducer;
