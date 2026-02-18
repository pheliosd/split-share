# React Native Frontend - Splitwise Alternative

Complete implementation of mobile app for expense sharing platform.

## 📱 Features Implemented

### ✅ Authentication
- Login & Register with form validation
- JWT token management
- Auto-login with AsyncStorage
- Secure logout

### ✅ Dashboard
- Balance overview cards
- Recent expenses list
- Quick actions (add expense, view groups)
- Pull to refresh

### ✅ Groups
- List all groups with search
- Create groups with types
- Group details (coming soon)
- Member management (coming soon)

### ✅ Expenses
- API integration ready
- Add expense flow (in progress)
- 4 split types support
- Expense details (coming soon)

### ✅ State Management
- Redux Toolkit with RTK Query
- API caching & auto-refetching
- Optimistic updates
- Error handling

### ✅ UI/UX
- Material Design 3 theming
- Responsive layouts
- Loading states
- Error boundaries
- Pull to refresh

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Run app
npm run ios     # iOS
npm run android # Android
npm start       # Metro bundler
```

## 📂 Project Structure

```
src/
├── api/           # RTK Query endpoints
│   ├── baseApi.ts
│   ├── authApi.ts
│   ├── groupsApi.ts
│   ├── expensesApi.ts
│   └── settlementsApi.ts
├── screens/       # Screen components
│   ├── auth/      # Login, Register
│   ├── home/      # Dashboard
│   ├── groups/    # List, Detail, Create
│   └── profile/   # Profile, Settings
├── navigation/    # React Navigation setup
├── store/         # Redux slices
├── theme/         # Theming config
└── types/         # TypeScript types
```

## 🔧 Configuration

### API URL
Update in `src/api/baseApi.ts`:
```typescript
const API_URL = 'http://your-backend-url/api/v1';
```

### Theme
Customize in `src/theme/index.ts`

## 📦 Dependencies

- React Native 0.73
- React Navigation 6
- Redux Toolkit
- React Native Paper
- React Hook Form
- Zod validation
- date-fns

## 🧪 Testing

```bash
npm test              # Run tests
npm run typecheck     # TypeScript check
npm run lint          # ESLint
```

## 📝 Next Steps

- [ ] Group detail screen
- [ ] Add expense with split types
- [ ] Expense detail & editing
- [ ] Settlement flows
- [ ] Push notifications
- [ ] Offline support
- [ ] Dark mode toggle

## 🐛 Troubleshooting

**Metro won't start:**
```bash
npm start -- --reset-cache
```

**iOS build fails:**
```bash
cd ios && pod install
```

**Android build fails:**
```bash
cd android && ./gradlew clean
```
