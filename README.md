# Splitwise Alternative - Expense Sharing Application

A production-grade expense sharing application built with React Native and Node.js.

## 🚀 Features

- **User Authentication**: JWT + OAuth (Google/Apple)
- **Group Management**: Create groups, add members, manage permissions
- **Expense Tracking**: Multiple split types (equal, exact, percentage, shares)
- **Smart Settlements**: Debt simplification algorithm
- **Multi-Currency**: Support for multiple currencies with locked exchange rates
- **Analytics**: Monthly summaries, spending insights, export data
- **OCR**: Receipt scanning and auto-detection
- **Offline Support**: Create expenses offline, sync when online
- **Real-time Updates**: WebSocket-based balance updates

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose
- React Native development environment (for mobile)

## 🛠️ Tech Stack

### Frontend
- React Native (TypeScript)
- Redux Toolkit (State management)
- React Navigation
- Axios (API client)

### Backend
- Node.js (TypeScript)
- Fastify (REST API)
- Prisma (PostgreSQL ORM)
- MongoDB (Activity logs)
- Redis (Caching)
- JWT + OAuth 2.0

### Databases
- PostgreSQL (Primary data)
- MongoDB (Logs, analytics)
- Redis (Cache, sessions)
- MinIO (S3-compatible storage)

## 📦 Project Structure

```
splitwise/
├── backend/          # Node.js backend API
├── frontend/         # React Native app
├── shared/           # Shared types and utilities
└── docker-compose.yml
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd splitwise
npm install
```

### 2. Start Services

```bash
# Start databases (PostgreSQL, MongoDB, Redis, MinIO)
npm run docker:up

# Wait for services to be healthy (~30 seconds)
```

### 3. Setup Database

```bash
# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### 4. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend   # Backend on http://localhost:3000
npm run dev:frontend  # Frontend Metro bundler
```

## 🗄️ Database Access

- **PostgreSQL**: `localhost:5432`
  - Database: `splitwise`
  - User: `admin`
  - Password: `dev_password_change_in_production`

- **MongoDB**: `localhost:27017`
  - Database: `splitwise`
  - User: `admin`
  - Password: `dev_password_change_in_production`

- **Redis**: `localhost:6379`
  - Password: `dev_password_change_in_production`

- **MinIO Console**: `http://localhost:9001`
  - User: `admin`
  - Password: `dev_password_change_in_production`

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Schema](./backend/database/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test --workspace=backend

# Run frontend tests
npm run test --workspace=frontend
```

## 📝 Environment Variables

Create `.env` files in `backend/` and `frontend/` directories:

### Backend `.env`
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://admin:dev_password_change_in_production@localhost:5432/splitwise
MONGO_URL=mongodb://admin:dev_password_change_in_production@localhost:27017/splitwise?authSource=admin
REDIS_URL=redis://:dev_password_change_in_production@localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Dinakar Potta
