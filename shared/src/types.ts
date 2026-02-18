// ============================================
// USER TYPES
// ============================================

export interface User {
    id: string;
    email?: string;
    phone?: string;
    name: string;
    avatarUrl?: string;
    defaultCurrency: string;
    isVerified: boolean;
    isAnonymous: boolean;
    oauthProvider?: 'google' | 'apple';
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    email?: string;
    phone?: string;
    password: string;
    name: string;
    defaultCurrency?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface OAuthLoginDto {
    provider: 'google' | 'apple';
    idToken: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// ============================================
// GROUP TYPES
// ============================================

export interface Group {
    id: string;
    name: string;
    description?: string;
    type: 'trip' | 'home' | 'couple' | 'office' | 'other';
    currency: string;
    avatarUrl?: string;
    createdBy: string;
    parentGroupId?: string;
    isArchived: boolean;
    simplifyDebts: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    role: 'admin' | 'member';
    joinedAt: string;
    user?: User;
}

export interface CreateGroupDto {
    name: string;
    description?: string;
    type: 'trip' | 'home' | 'couple' | 'office' | 'other';
    currency: string;
    memberIds: string[];
    parentGroupId?: string;
}

export interface UpdateGroupDto {
    name?: string;
    description?: string;
    simplifyDebts?: boolean;
}

// ============================================
// EXPENSE TYPES
// ============================================

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface Expense {
    id: string;
    groupId: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    category?: string;
    notes?: string;
    payerId: string;
    splitType: SplitType;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    isDraft: boolean;
    isFrozen: boolean;
    receiptUrl?: string;
    exchangeRateToGroupCurrency?: number;
    groupCurrency?: string;
    isTemplate: boolean;
    templateName?: string;
    payer?: User;
    splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
    id: string;
    expenseId: string;
    userId: string;
    amount?: number;
    percentage?: number;
    shares?: number;
    owedAmount: number;
    user?: User;
}

export interface CreateExpenseDto {
    groupId: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    category?: string;
    notes?: string;
    payerId: string;
    splitType: SplitType;
    splits: Array<{
        userId: string;
        amount?: number;
        percentage?: number;
        shares?: number;
    }>;
    isDraft?: boolean;
}

export interface UpdateExpenseDto {
    description?: string;
    amount?: number;
    date?: string;
    category?: string;
    notes?: string;
    payerId?: string;
    splitType?: SplitType;
    splits?: Array<{
        userId: string;
        amount?: number;
        percentage?: number;
        shares?: number;
    }>;
}

// ============================================
// BALANCE TYPES
// ============================================

export interface Balance {
    id: string;
    groupId: string;
    userId: string;
    currency: string;
    balance: number;
    updatedAt: string;
    user?: User;
}

export interface UserBalance {
    userId: string;
    userName: string;
    avatarUrl?: string;
    balance: number;
    currency: string;
}

// ============================================
// SETTLEMENT TYPES
// ============================================

export interface Settlement {
    id: string;
    groupId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
    date: string;
    notes?: string;
    paymentMethod?: string;
    paymentReference?: string;
    isPartial: boolean;
    createdBy: string;
    createdAt: string;
    payer?: User;
    payee?: User;
}

export interface CreateSettlementDto {
    groupId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
    date: string;
    notes?: string;
    paymentMethod?: string;
    paymentReference?: string;
    isPartial?: boolean;
}

export interface SimplifiedDebt {
    from: string;
    to: string;
    amount: number;
    currency: string;
    fromUser?: User;
    toUser?: User;
}

export interface SuggestedSettlementsResponse {
    simplified: SimplifiedDebt[];
    explanation: string;
}

// ============================================
// ACTIVITY TYPES
// ============================================

export interface ActivityLog {
    id: string;
    userId: string;
    groupId: string;
    entityType: 'expense' | 'settlement' | 'group' | 'member';
    entityId: string;
    action: string;
    description: string;
    metadata: Record<string, any>;
    timestamp: string;
    tags: string[];
    category?: string;
    user?: User;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface Analytics {
    totalExpenses: number;
    categoryBreakdown: Record<string, number>;
    topPayers: Array<{ userId: string; userName: string; amount: number }>;
    topOwers: Array<{ userId: string; userName: string; amount: number }>;
    averageExpense: number;
    trends?: Record<string, any>;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export interface ApiError {
    error: {
        message: string;
        statusCode: number;
        details?: any;
    };
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface ExpenseFilters {
    groupId?: string;
    category?: string;
    payerId?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

export interface ExpenseSearchParams extends ExpenseFilters {
    limit?: number;
    offset?: number;
    sortBy?: 'date' | 'amount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
