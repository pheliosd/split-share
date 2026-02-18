# Backend API

Node.js backend API for Splitwise Alternative application.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL
- MongoDB
- Redis

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npm run generate

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management
│   │   ├── groups/        # Group management
│   │   ├── expenses/      # Expense management
│   │   ├── settlements/   # Settlement management
│   │   └── ...
│   ├── common/            # Shared code
│   │   ├── config/        # Configuration
│   │   ├── middlewares/   # Fastify middlewares
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   ├── database/          # Database related
│   │   ├── prisma/        # Prisma schema
│   │   └── mongo/         # MongoDB schemas
│   └── server.ts          # Main entry point
├── tests/                 # Test files
├── prisma/
│   └── schema.prisma      # Database schema
└── package.json
```

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run generate

# Create migration
npm run migrate

# Apply migrations (production)
npm run migrate:deploy

# Reset database (dev only)
npm run migrate:reset

# Open Prisma Studio
npm run studio
```

### Seed Data

```bash
npm run seed
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📝 API Documentation

API runs on `http://localhost:3000`

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/oauth/google` - OAuth login

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update profile

### Groups
- `POST /api/v1/groups` - Create group
- `GET /api/v1/groups` - List groups
- `GET /api/v1/groups/:id` - Get group details

### Expenses
- `POST /api/v1/expenses` - Create expense
- `GET /api/v1/expenses` - List expenses
- `PATCH /api/v1/expenses/:id` - Update expense

### Settlements
- `POST /api/v1/settlements` - Record settlement
- `GET /api/v1/settlements` - List settlements

## 🏗️ Architecture

- **Framework:** Fastify
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** JWT + OAuth 2.0
- **Caching:** Redis
- **File Storage:** S3-compatible (MinIO)

## 📦 Core Utilities

### MoneyCalculator
Precise decimal arithmetic for financial calculations:
```typescript
import { MoneyCalculator } from './common/utils/money-calculator';

const result = MoneyCalculator.split(100, 3);
// => [33.34, 33.33, 33.33]
```

### Debt Simplification
Minimize settlement transactions:
```typescript
import { simplifyDebts } from './common/utils/debt-simplification';

const simplified = simplifyDebts(balances);
```

## 🔒 Security

- JWT-based authentication
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation with Zod

## 🚀 Deployment

### Docker

```bash
# Build
docker build -t splitwise-backend .

# Run
docker run -p 3000:3000 --env-file .env splitwise-backend
```

### Docker Compose

```bash
docker-compose up backend
```

## 📊 Monitoring

- Logs: Pino logger
- Health check: `GET /health`

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Submit PR

## 📄 License

MIT
