# Setup Guide (Without Docker)

Since you're not using Docker, you'll need to install the databases natively on Windows.

## Prerequisites Installation

### 1. PostgreSQL
Download and install from: https://www.postgresql.org/download/windows/

**After installation:**
```bash
# Create database
psql -U postgres
CREATE DATABASE splitwise;
CREATE USER admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE splitwise TO admin;
\q
```

Update `.env`:
```
DATABASE_URL=postgresql://admin:your_password@localhost:5432/splitwise
```

### 2. MongoDB
Download and install from: https://www.mongodb.com/try/download/community

**After installation:**
```bash
# Start MongoDB service (usually starts automatically)
# Or use: net start MongoDB

# Create user
mongosh
use splitwise
db.createUser({
  user: "admin",
  pwd: "your_password",
  roles: [{ role: "readWrite", db: "splitwise" }]
})
```

Update `.env`:
```
MONGO_URL=mongodb://admin:your_password@localhost:27017/splitwise?authSource=admin
```

### 3. Redis
Download from: https://github.com/microsoftarchive/redis/releases

Or use WSL/Memurai (Redis alternative for Windows)

Update `.env`:
```
REDIS_URL=redis://localhost:6379
```

### 4. MinIO (Optional - for file storage)
Can skip for now, or use cloud storage (AWS S3, Cloudflare R2)

## Running the Application

### 1. Install Dependencies
```bash
# In project root
npm install

# Or if PowerShell execution policy issues:
# Run PowerShell as Administrator and execute:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### 3. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Start Backend
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Testing the API

Once running, you can test endpoints:

**Register User:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Alternative: Cloud Databases

If you prefer not to install locally:

- **PostgreSQL**: Use [Supabase](https://supabase.com) (free tier)
- **MongoDB**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **Redis**: Use [Upstash](https://upstash.com) (free tier)

Just update the connection strings in `.env` file.
