// Re-export shared types
export * from '../../../shared/src/types';

// Additional frontend-specific types
export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface UIState {
    theme: 'light' | 'dark';
    loading: Record<string, boolean>;
    errors: Record<string, string | null>;
}

// Navigation types
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type MainTabsParamList = {
    Home: undefined;
    Groups: undefined;
    Activity: undefined;
    Profile: undefined;
};

export type HomeStackParamList = {
    Dashboard: undefined;
    ExpenseDetail: { expenseId: string };
    AddExpense: { groupId?: string };
};

export type GroupsStackParamList = {
    GroupList: undefined;
    GroupDetail: { groupId: string };
    CreateGroup: undefined;
    EditGroup: { groupId: string };
    GroupSettings: { groupId: string };
};

export type ProfileStackParamList = {
    ProfileScreen: undefined;
    Friends: undefined;
    Settings: undefined;
    EditProfile: undefined;
};

// Form types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
}

export interface ExpenseFormData {
    groupId: string;
    description: string;
    amount: number;
    currency: string;
    date: Date;
    category?: string;
    notes?: string;
    payerId: string;
    splitType: 'equal' | 'exact' | 'percentage' | 'shares';
    splits: Array<{
        userId: string;
        amount?: number;
        percentage?: number;
        shares?: number;
    }>;
    isDraft?: boolean;
}

export interface GroupFormData {
    name: string;
    description?: string;
    type: 'trip' | 'home' | 'couple' | 'office' | 'other';
    currency: string;
    memberIds: string[];
}

export interface SettlementFormData {
    groupId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
    notes?: string;
    date?: Date;
}
