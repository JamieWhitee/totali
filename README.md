# Totali - Personal Item Value Tracking System

A full-stack web application to help users record, track, and analyze the value and usage of personal items.

[中文文档](./README.cn.md) | English

## 📋 Project Overview

Totali is a full-stack web application for managing and tracking the value, usage frequency, and maintenance records of personal items.

### Tech Stack

**Frontend**

- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth (User Authentication)

**Backend**

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Supabase (JWT Verification Only)

## 🚀 Quick Start

### Prerequisites

Ensure you have the following tools installed:

- Node.js >= 18.x
- npm or yarn
- PostgreSQL >= 14.x
- Redis >= 6.x
- Docker & Docker Compose (optional, recommended)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd totali
```

### 2. Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Install Dependencies

```bash
npm install
```

#### 2.3 Configure Environment Variables

Copy `.env.example` and rename it to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file with your configurations:

```env
# Application
NODE_ENV=development
PORT=3001

# Database - PostgreSQL
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/totali?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### 2.4 Start Database Services (using Docker)

If using Docker Compose:

```bash
docker-compose up -d
```

#### 2.5 Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with initial data
npx prisma db seed
```

#### 2.6 Start Backend Server

```bash
npm run start:dev
```

Backend will run at `http://localhost:3001`

### 3. Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd ../frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Configure Environment Variables

Copy `.env.example` and rename it to `.env.local`:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 3.4 Start Frontend Server

```bash
npm run dev
```

Frontend will run at `http://localhost:3000`

## 📦 Project Structure

```
totali/
├── backend/                 # Backend NestJS Application
│   ├── src/
│   │   ├── modules/        # Feature Modules
│   │   │   ├── auth/      # Authentication Module
│   │   │   ├── database/  # Database Module
│   │   │   └── cache/     # Cache Module
│   │   ├── common/        # Common Utilities
│   │   └── config/        # Configuration Files
│   ├── prisma/            # Prisma Database Configuration
│   │   └── schema.prisma  # Database Schema
│   └── docker-compose.yml # Docker Configuration
│
└── frontend/              # Frontend Next.js Application
    ├── app/              # Next.js App Router
    ├── components/       # React Components
    ├── lib/             # Utilities and Configuration
    │   ├── api/        # API Client
    │   └── hooks/      # React Hooks
    └── types/           # TypeScript Type Definitions
```

## 🔐 Supabase Configuration

### Create Supabase Project

1. Visit [Supabase](https://supabase.com/)
2. Create a new project
3. Obtain the following credentials:
   - Project URL (`SUPABASE_URL`)
   - Anon/Public Key (`SUPABASE_ANON_KEY`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

### Configure Authentication

In Supabase Dashboard:

1. Go to **Authentication** → **Settings**
2. Configure Email Provider (if using email verification)
3. Add Redirect URLs: `http://localhost:3000/*`

## 🗄️ Database Setup

### Using Docker (Recommended)

The project includes `docker-compose.yml`. Simply run:

```bash
cd backend
docker-compose up -d
```

This will start:

- PostgreSQL (port 5432)
- Redis (port 6379)

### Manual Installation

If not using Docker, you need to manually install and start PostgreSQL and Redis.

## 📚 API Documentation

After starting the backend, access Swagger documentation at:

```
http://localhost:3001/api
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🔧 Common Commands

### Backend

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database migrations
npx prisma migrate dev
npx prisma studio  # Open database management UI
```

### Frontend

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start

# Lint code
npm run lint
```

## ⚠️ Important Notes

1. **Never commit `.env` files**: All environment variable files are ignored by `.gitignore`
2. **Supabase is for authentication only**: User data is stored in local PostgreSQL
3. **Run migrations on first setup**: Execute `npx prisma migrate dev`
4. **Ensure Redis and PostgreSQL are running**: Required for backend functionality

## 🏗️ Architecture

### Hybrid Authentication Model

- **Supabase**: Handles user registration and login authentication
- **Local PostgreSQL**: Stores all business data and user profiles
- **JWT Tokens**: Issued by Supabase, validated by backend

### Data Flow

```
User Registration/Login
    ↓
Supabase Auth (JWT issued)
    ↓
Frontend sends request with JWT
    ↓
Backend validates JWT with Supabase
    ↓
Sync user to local PostgreSQL
    ↓
All business operations on local database
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

[MIT License](LICENSE)

## 📧 Contact

For questions or issues, please create an Issue or contact the project maintainers.

---

## 🚨 Security Notice

- Never commit `.env` or `.env.local` files
- Keep your Supabase Service Role Key secret
- Use environment variables for all sensitive information
- Rotate keys regularly in production

---

**Happy Coding! 🚀**
