# Totali - Project Instruction Guide

## 📖 Project Overview

**Totali** is a full-stack personal item value tracking system that helps users record, track, and analyze the value, usage frequency, and lifecycle of their personal belongings. The application features a hybrid authentication model using Supabase for auth and local PostgreSQL for business data.

---

## 🏗️ Architecture & Tech Stack

### **Frontend Stack**

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: Radix UI (shadcn/ui components)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **Authentication**: Supabase Auth Client
- **Icons**: Lucide React
- **Charts**: Recharts
- **Rich Text Editor**: Tiptap
- **Date Handling**: date-fns

### **Backend Stack**

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase JWT Verification
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, CORS, Rate Limiting (Throttler)
- **Logging**: Winston
- **Deployment**: Vercel Serverless Functions

### **Infrastructure**

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Vercel Serverless
- **Database**: Supabase PostgreSQL (Managed)
- **Authentication**: Supabase Auth
- **Development**: Hot reload enabled for both frontend and backend
- **Cost**: $0/month (Free tier)

---

## 📁 Project Structure

```
totali/
├── frontend/                      # Next.js Frontend Application
│   ├── app/                       # Next.js App Router
│   │   ├── (home)/               # Protected routes group
│   │   │   ├── analytics/        # Analytics dashboard
│   │   │   ├── items/            # Item management pages
│   │   │   └── page.tsx          # Home page
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── signin/           # Sign in page
│   │   │   └── signup/           # Sign up page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # React Components
│   │   ├── business/             # Business logic components
│   │   ├── common/               # Shared components
│   │   ├── layout/               # Layout components
│   │   ├── providers/            # Context providers
│   │   └── ui/                   # UI components (shadcn/ui)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and configurations
│   │   ├── api/                  # API client functions
│   │   ├── supabase.ts           # Supabase client setup
│   │   └── utils.ts              # Helper functions
│   ├── types/                    # TypeScript type definitions
│   ├── .env.example              # Environment variables template
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── package.json              # Frontend dependencies
│
├── backend/                       # NestJS Backend Application
│   ├── api/                      # Vercel Serverless entry
│   │   └── index.ts              # Serverless function handler
│   ├── src/
│   │   ├── modules/              # Feature modules
│   │   │   ├── auth/             # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── guards/       # Auth guards
│   │   │   ├── database/         # Database module (Prisma)
│   │   │   └── items/            # Items management module
│   │   ├── common/               # Shared utilities
│   │   │   ├── filters/          # Exception filters
│   │   │   └── interceptors/     # Response interceptors
│   │   ├── config/               # Configuration files
│   │   │   └── logger.config.ts  # Winston logger config
│   │   ├── types/                # TypeScript types
│   │   ├── app.module.ts         # Root module
│   │   └── main.ts               # Application entry point
│   ├── prisma/                   # Prisma ORM
│   │   ├── schema.prisma         # Database schema (Supabase)
│   │   └── seed.ts               # Database seeding script
│   ├── test/                     # Test files
│   ├── vercel.json               # Vercel configuration
│   ├── .vercelignore             # Vercel ignore rules
│   ├── .env.example              # Environment variables template
│   └── package.json              # Backend dependencies
│
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation (English)
├── README.cn.md                   # Project documentation (Chinese)
└── INSTRUCTION.md                 # This file
```

---

## 🗄️ Database Schema

### **Core Entities**

1. **User** - User profiles synced from Supabase
   - `id` (UUID, from Supabase)
   - `email`, `name`, `avatarUrl`
   - Relations: categories, items, usageRecords, aiQueries, settings

2. **UserSettings** - User preferences
   - `dailyReminder`, `reminderTime`
   - One-to-one with User

3. **Category** - Item categories
   - `name`, `icon`, `isSystem`
   - Unique per user
   - Relations: items

4. **Item** - Personal items
   - `name`, `purchasePrice`, `purchaseDate`, `expectedLife`
   - `status` (ACTIVE, RETIRED, SOLD)
   - `soldPrice`, `soldDate` (for sold items)
   - `imageUrl`, `notes`
   - Relations: category, usageRecords, aiQueries

5. **UsageRecord** - Daily usage tracking
   - `usageDate`
   - Unique constraint: one record per user/item/date
   - Relations: user, item

6. **AIQuery** - AI price estimation records
   - `responsePrice`, `queryStatus` (SUCCESS, FAILED)
   - Relations: user, item

---

## 🚀 Getting Started

### **Prerequisites**

Ensure the following are installed:

- Node.js >= 18.x
- npm or yarn
- Supabase account (free tier available)
- Vercel account (free tier available)

### **1. Clone Repository**

```bash
git clone <repository-url>
cd totali
```

### **2. Backend Setup**

#### Step 2.1: Install Dependencies

```bash
cd backend
npm install
```

#### Step 2.2: Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy the following credentials:
   - Project URL
   - `anon` public key
   - `service_role` secret key
4. Go to **SQL Editor** and run the database schema (see Database Setup section)

#### Step 2.3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Application
NODE_ENV=development
PORT=3001

# Supabase Database
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Step 2.4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables (using Supabase SQL Editor)
# Copy and run the SQL from prisma/schema.prisma
```

#### Step 2.5: Start Backend Server

```bash
npm run start:dev
```

Backend runs at: `http://localhost:3001`
API Docs at: `http://localhost:3001/docs`

### **3. Frontend Setup**

#### Step 3.1: Install Dependencies

```bash
cd ../frontend
npm install
```

#### Step 3.2: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### Step 3.3: Start Frontend Server

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔐 Authentication Flow

### **Hybrid Authentication Model**

The application uses a hybrid approach:

1. **Supabase** handles user registration and authentication
2. **Local PostgreSQL** stores all business data
3. **JWT tokens** issued by Supabase are validated by the backend

### **Authentication Workflow**

```
┌─────────────────────────────────────────────────────────────┐
│                    User Registration/Login                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Supabase Auth (Issues JWT Token)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│      Frontend Stores Token & Sends with API Requests        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Backend Validates JWT with Supabase                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│      Sync User Profile to Local PostgreSQL                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│      All Business Operations on Local Database               │
└─────────────────────────────────────────────────────────────┘
```

### **Key Points**

- Supabase is **only** used for authentication
- All user data and business logic stored in local PostgreSQL
- Backend validates JWT tokens on every protected route
- User profiles are automatically synced to local database

---

## 🔄 Application Workflow

### **User Journey**

1. **Registration/Login**
   - User signs up/in via Supabase Auth
   - Frontend receives JWT token
   - Token stored in local storage/cookies

2. **Dashboard Access**
   - User navigates to protected routes
   - Frontend sends JWT with API requests
   - Backend validates token and syncs user profile

3. **Item Management**
   - Create categories for organizing items
   - Add items with purchase details
   - Upload item images
   - Track item status (Active/Retired/Sold)

4. **Usage Tracking**
   - Record daily usage of items
   - One record per item per day
   - View usage history and patterns

5. **Analytics**
   - View item value depreciation
   - Analyze usage frequency
   - Track cost-per-use metrics
   - AI-powered price estimation

---

## 🛠️ Development Commands

### **Backend Commands**

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database operations
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Run migrations
npx prisma studio            # Open database GUI
npx prisma db seed           # Seed database

# Testing
npm run test                 # Unit tests
npm run test:e2e             # E2E tests
npm run test:cov             # Coverage report

# Code quality
npm run lint                 # Lint code
npm run format               # Format code with Prettier
```

### **Frontend Commands**

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start

# Code quality
npm run lint                 # Lint code
npm run format               # Format code with Prettier
```

---

## 📡 API Endpoints

### **Authentication**

- `POST /api/v1/auth/signin` - User sign in
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signout` - User sign out
- `GET /api/v1/auth/profile` - Get current user profile

### **Items**

- `GET /api/v1/items` - List all items
- `POST /api/v1/items` - Create new item
- `GET /api/v1/items/:id` - Get item details
- `PATCH /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item (soft delete)

### **Categories**

- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### **Usage Records**

- `GET /api/v1/usage-records` - List usage records
- `POST /api/v1/usage-records` - Create usage record
- `DELETE /api/v1/usage-records/:id` - Delete record

### **Analytics**

- `GET /api/v1/analytics/overview` - Dashboard overview
- `GET /api/v1/analytics/items/:id` - Item analytics

**Full API documentation available at:** `http://localhost:3001/docs`

---

## 🧪 Testing Strategy

### **Backend Testing**

- Unit tests for services and controllers
- E2E tests for API endpoints
- Database mocking with Prisma
- JWT validation testing

### **Frontend Testing**

- Component testing (not yet implemented)
- Integration testing (not yet implemented)
- E2E testing with Playwright (recommended)

---

## 🔒 Security Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Protected routes with guards
   - Role-based access control (future)

2. **API Security**
   - Helmet for security headers
   - CORS configuration
   - Rate limiting (Throttler)
   - Request validation (class-validator)

3. **Data Security**
   - Password hashing with bcryptjs
   - SQL injection prevention (Prisma)
   - XSS protection
   - CSRF protection (cookies)

4. **Environment Security**
   - Environment variables for secrets
   - `.env` files in `.gitignore`
   - Separate dev/prod configurations

---

## 🚨 Important Notes

### **Environment Variables**

- **Never commit** `.env` or `.env.local` files
- Always use `.env.example` as template
- Keep Supabase Service Role Key secret
- Rotate keys regularly in production

### **Database**

- Run migrations before starting backend
- Use `prisma studio` for database inspection
- Backup database regularly in production

### **Supabase Configuration**

1. Create project at [supabase.com](https://supabase.com)
2. Get credentials: URL, Anon Key, Service Role Key
3. Configure redirect URLs in Supabase Dashboard
4. Enable email authentication provider

### **Docker**

- PostgreSQL runs on port **5433** (not default 5432)
- Redis runs on port **6379**
- Use `docker-compose down -v` to remove volumes

---

## 🐛 Troubleshooting

### **Backend Issues**

**Problem**: Database connection failed

```bash
# Check if PostgreSQL is running
docker ps

# Check DATABASE_URL in .env
# Ensure port is 5433 if using Docker
```

**Problem**: Prisma Client not found

```bash
# Regenerate Prisma Client
npx prisma generate
```

**Problem**: Redis connection failed

```bash
# Check if Redis is running
docker ps

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

### **Frontend Issues**

**Problem**: API requests failing

```bash
# Check NEXT_PUBLIC_API_URL in .env.local
# Ensure backend is running on port 3001
```

**Problem**: Supabase authentication not working

```bash
# Verify Supabase credentials in .env.local
# Check Supabase Dashboard for redirect URLs
```

---

## 📦 Deployment

### **Current Deployment Architecture**

- **Frontend**: Vercel (https://totali-xxx.vercel.app)
- **Backend**: Vercel Serverless (https://totali-kappa.vercel.app)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Total Cost**: $0/month (Free tier)

### **Backend Deployment (Vercel)**

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure project:
   - **Root Directory**: `backend`
   - **Framework Preset**: NestJS (auto-detected)
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   SUPABASE_URL=https://...
   SUPABASE_ANON_KEY=sb_publishable_...
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Deploy

### **Frontend Deployment (Vercel)**

1. Connect same repository to Vercel (new project)
2. Configure project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
4. Deploy

### **Database Setup (Supabase)**

1. Create Supabase project
2. Run SQL schema in SQL Editor
3. Configure Row Level Security (RLS) policies
4. Copy connection strings for backend

### **Important Notes**

- Backend uses Vercel Serverless Functions (cold start: 1-3s)
- Database tables created via Supabase SQL Editor
- No Redis cache in production (removed for cost optimization)
- All secrets stored in Vercel environment variables

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### **Code Style**

- Follow existing code patterns
- Use TypeScript strict mode
- Write meaningful commit messages
- Add comments for complex logic
- Run linter before committing

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📧 Support

For questions or issues:

- Create an issue in the repository
- Contact project maintainers
- Check existing documentation

---

**Happy Coding! 🚀**

*Last Updated: December 2024*

## 📝 Recent Changes

### December 2024
- ✅ Migrated from local PostgreSQL to Supabase
- ✅ Removed Redis cache dependency
- ✅ Deployed backend to Vercel Serverless
- ✅ Deployed frontend to Vercel
- ✅ Achieved $0/month hosting cost
- ⚠️ Known issues: Some features incomplete (see GitHub Issues)
