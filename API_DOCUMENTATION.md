# Splitwise Alternative - Complete API Documentation

## 🔐 Authentication

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "defaultCurrency": "USD"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### OAuth Login
```http
POST /api/v1/auth/oauth/:provider
Content-Type: application/json

{
  "provider": "google",
  "idToken": "...",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

### Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

## 👥 Users

### Get Profile
```http
GET /api/v1/users/me
Authorization: Bearer {accessToken}
```

### Update Profile
```http
PATCH /api/v1/users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatarUrl": "https://...",
  "defaultCurrency": "EUR"
}
```

### Search Users
```http
GET /api/v1/users/search?q=john&limit=20
Authorization: Bearer {accessToken}
```

### Get Friends
```http
GET /api/v1/users/friends
Authorization: Bearer {accessToken}
```

### Add Friend
```http
POST /api/v1/users/friends
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "friendId": "uuid"
}
```

### Accept Friend Request
```http
POST /api/v1/users/friends/:friendshipId/accept
Authorization: Bearer {accessToken}
```

### Remove Friend
```http
DELETE /api/v1/users/friends/:userId
Authorization: Bearer {accessToken}
```

## 👨‍👩‍👧‍👦 Groups

### Create Group
```http
POST /api/v1/groups
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Trip to Vegas",
  "description": "Group expenses for our trip",
  "type": "trip",
  "currency": "USD",
  "memberIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Get All Groups
```http
GET /api/v1/groups
Authorization: Bearer {accessToken}
```

### Get Group Details
```http
GET /api/v1/groups/:groupId
Authorization: Bearer {accessToken}
```

### Update Group
```http
PATCH /api/v1/groups/:groupId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated name",
  "simplifyDebts": true
}
```

### Add Members
```http
POST /api/v1/groups/:groupId/members
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "userIds": ["uuid1", "uuid2"]
}
```

### Remove Member
```http
DELETE /api/v1/groups/:groupId/members/:userId
Authorization: Bearer {accessToken}
```

### Archive Group
```http
POST /api/v1/groups/:groupId/archive
Authorization: Bearer {accessToken}
```

### Get Group Balances
```http
GET /api/v1/groups/:groupId/balances
Authorization: Bearer {accessToken}
```

**Response includes:**
- Individual balances for each member
- Simplified debts (if enabled)

## 💰 Expenses

### Create Expense

**Equal Split:**
```http
POST /api/v1/expenses
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "groupId": "uuid",
  "description": "Dinner at restaurant",
  "amount": 150.00,
  "currency": "USD",
  "date": "2026-02-17",
  "category": "food",
  "payerId": "uuid",
  "splitType": "equal",
  "splits": [
    { "userId": "uuid1" },
    { "userId": "uuid2" },
    { "userId": "uuid3" }
  ]
}
```

**Exact Split:**
```http
{
  "splitType": "exact",
  "splits": [
    { "userId": "uuid1", "amount": 50.00 },
    { "userId": "uuid2", "amount": 75.00 },
    { "userId": "uuid3", "amount": 25.00 }
  ]
}
```

**Percentage Split:**
```http
{
  "splitType": "percentage",
  "splits": [
    { "userId": "uuid1", "percentage": 40 },
    { "userId": "uuid2", "percentage": 35 },
    { "userId": "uuid3", "percentage": 25 }
  ]
}
```

**Shares Split:**
```http
{
  "splitType": "shares",
  "splits": [
    { "userId": "uuid1", "shares": 2 },
    { "userId": "uuid2", "shares": 1 },
    { "userId": "uuid3", "shares": 1 }
  ]
}
```

### Get Expenses (with filters)
```http
GET /api/v1/expenses?groupId=uuid&startDate=2026-01-01&limit=50&sortBy=date&sortOrder=desc
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `groupId` - Filter by group
- `category` - Filter by category
- `payerId` - Filter by payer
- `startDate` - From date
- `endDate` - To date
- `minAmount` - Minimum amount
- `maxAmount` - Maximum amount
- `search` - Search in description/notes
- `limit` - Results per page (default: 50)
- `offset` - Offset for pagination
- `sortBy` - Sort field (date, amount, createdAt)
- `sortOrder` - asc or desc

### Get Expense Details
```http
GET /api/v1/expenses/:expenseId
Authorization: Bearer {accessToken}
```

**Response includes:**
- Full expense details
- All splits with user info
- Comments
- History/audit trail

### Update Expense
```http
PATCH /api/v1/expenses/:expenseId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "description": "Updated description",
  "amount": 160.00,
  "notes": "Added tip"
}
```

### Delete Expense
```http
DELETE /api/v1/expenses/:expenseId
Authorization: Bearer {accessToken}
```

### Add Comment
```http
POST /api/v1/expenses/:expenseId/comments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "comment": "This was a great dinner!"
}
```

## 💸 Settlements

### Record Settlement
```http
POST /api/v1/settlements
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "groupId": "uuid",
  "payerId": "uuid",
  "payeeId": "uuid",
  "amount": 50.00,
  "currency": "USD",
  "paymentMethod": "Cash",
  "notes": "Paid back for dinner",
  "date": "2026-02-17"
}
```

### Get Settlements
```http
GET /api/v1/settlements?groupId=uuid&limit=50
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `groupId` - Filter by group
- `startDate` - From date
- `endDate` - To date
- `limit` - Results per page
- `offset` - Offset for pagination

### Get Settlement Details
```http
GET /api/v1/settlements/:settlementId
Authorization: Bearer {accessToken}
```

### Delete Settlement
```http
DELETE /api/v1/settlements/:settlementId
Authorization: Bearer {accessToken}
```

## 📊 API Summary

### Total Endpoints: 40+

**Authentication (7 endpoints)**
- Register, Login, OAuth, Refresh, Logout, Get Me, Change Password

**Users (7 endpoints)**
- Profile CRUD, Search, Friend Management

**Groups (8 endpoints)**
- CRUD, Member Management, Balance Tracking

**Expenses (6 endpoints)**
- CRUD with 4 split types, Comments, Advanced Filtering

**Settlements (4 endpoints)**
- CRUD, Payment History

### Response Format

**Success:**
```json
{
  "data": { ... },
  "message": "Success"
}
```

**Error:**
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

### Authentication

All protected endpoints require:
```
Authorization: Bearer {accessToken}
```

Access tokens expire in 1 hour. Use the refresh token endpoint to get a new access token.

### Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 500 requests per minute per user

### Pagination

Endpoints supporting pagination:
- Use `limit` and `offset` parameters
- Response includes `total`, `hasMore` fields

### Special Features

1. **Precise Money Calculation**: Using Decimal.js for all financial operations
2. **Debt Simplification**: Minimizes number of transactions needed to settle balances
3. **Audit Trail**: Full history for expenses with change tracking
4. **Real-time Balance Updates**: Automatic recalculation on expense/settlement changes
5. **Draft Expenses**: Save incomplete expenses
6. **Frozen Expenses**: Protect critical expenses from modification
