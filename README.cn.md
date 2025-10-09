# Totali - 个人物品价值追踪系统

Personal Item Value Tracking System - 帮助用户记录、追踪和分析个人物品的价值及使用情况。

## 📋 项目简介

Totali 是一个全栈 Web 应用，用于管理和追踪个人物品的价值、使用频率和维护记录。

### 技术栈

**前端 (Frontend)**

- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth (用户认证)

**后端 (Backend)**

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Supabase (仅用于 JWT 验证)

## 🚀 快速开始

### 前置要求

确保您的系统已安装以下工具：

- Node.js >= 18.x
- npm 或 yarn
- PostgreSQL >= 14.x
- Redis >= 6.x
- Docker & Docker Compose (可选，推荐)

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd totali
```

### 2. 配置后端

#### 2.1 进入后端目录

```bash
cd backend
```

#### 2.2 安装依赖

```bash
npm install
```

#### 2.3 配置环境变量

复制 `.env.example` 并重命名为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的配置：

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

#### 2.4 启动数据库服务 (使用 Docker)

如果使用 Docker Compose：

```bash
docker-compose up -d
```

#### 2.5 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# (可选) 填充种子数据
npx prisma db seed
```

#### 2.6 启动后端服务

```bash
npm run start:dev
```

后端将运行在 `http://localhost:3001`

### 3. 配置前端

#### 3.1 进入前端目录

```bash
cd ../frontend
```

#### 3.2 安装依赖

```bash
npm install
```

#### 3.3 配置环境变量

复制 `.env.example` 并重命名为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 3.4 启动前端服务

```bash
npm run dev
```

前端将运行在 `http://localhost:3000`

## 📦 项目结构

```
totali/
├── backend/                 # 后端 NestJS 应用
│   ├── src/
│   │   ├── modules/        # 功能模块
│   │   │   ├── auth/      # 认证模块
│   │   │   ├── database/  # 数据库模块
│   │   │   └── cache/     # 缓存模块
│   │   ├── common/        # 公共模块
│   │   └── config/        # 配置文件
│   ├── prisma/            # Prisma 数据库配置
│   │   └── schema.prisma  # 数据库模型
│   └── docker-compose.yml # Docker 配置
│
└── frontend/              # 前端 Next.js 应用
    ├── app/              # Next.js App Router
    ├── components/       # React 组件
    ├── lib/             # 工具函数和配置
    │   ├── api/        # API 客户端
    │   └── hooks/      # React Hooks
    └── types/           # TypeScript 类型定义
```

## 🔐 Supabase 配置

### 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 获取以下信息：
   - Project URL (`SUPABASE_URL`)
   - Anon/Public Key (`SUPABASE_ANON_KEY`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

### 配置认证

在 Supabase Dashboard 中：

1. 进入 **Authentication** → **Settings**
2. 配置 Email Provider (如果使用邮箱验证)
3. 添加 Redirect URLs：`http://localhost:3000/*`

## 🗄️ 数据库设置

### 使用 Docker (推荐)

项目已包含 `docker-compose.yml`，运行：

```bash
cd backend
docker-compose up -d
```

这将启动：

- PostgreSQL (端口 5432)
- Redis (端口 6379)

### 手动安装

如果不使用 Docker，需要手动安装并启动 PostgreSQL 和 Redis。

## 📚 API 文档

启动后端后，访问 Swagger 文档：

```
http://localhost:3001/api
```

## 🧪 测试

### 后端测试

```bash
cd backend
npm run test
```

### 前端测试

```bash
cd frontend
npm run test
```

## 🔧 常用命令

### 后端

```bash
# 开发模式
npm run start:dev

# 生产构建
npm run build
npm run start:prod

# 数据库迁移
npx prisma migrate dev
npx prisma studio  # 打开数据库管理界面
```

### 前端

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm run start

# 代码检查
npm run lint
```

## ⚠️ 注意事项

1. **不要提交 `.env` 文件**：所有环境变量文件已被 `.gitignore` 忽略
2. **Supabase 仅用于认证**：用户数据存储在本地 PostgreSQL
3. **首次运行需要运行数据库迁移**：`npx prisma migrate dev`
4. **确保 Redis 和 PostgreSQL 正常运行**

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 📧 联系方式

如有问题，请提交 Issue 或联系项目维护者。

---

**Happy Coding! 🚀**
