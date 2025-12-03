/**
 * 生产环境数据库初始化脚本
 * Production Database Initialization Script
 * 
 * 用于在生产环境中初始化数据库表和种子数据
 * Used to initialize database tables and seed data in production
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting production database initialization...');

  try {
    // 1. 检查数据库连接
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // 2. 检查表是否存在
    console.log('🔍 Checking if tables exist...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Existing tables:', tables);

    // 3. 检查是否有分类数据
    console.log('🔍 Checking categories...');
    const categoryCount = await prisma.category.count();
    console.log(`📊 Found ${categoryCount} categories`);

    if (categoryCount === 0) {
      console.log('📝 Creating default categories...');
      
      const defaultCategories = [
        { name: 'Electronics', icon: '💻', description: 'Electronic devices and gadgets' },
        { name: 'Furniture', icon: '🪑', description: 'Home and office furniture' },
        { name: 'Clothing', icon: '👕', description: 'Clothes and accessories' },
        { name: 'Books', icon: '📚', description: 'Books and publications' },
        { name: 'Sports', icon: '⚽', description: 'Sports equipment and gear' },
        { name: 'Kitchen', icon: '🍳', description: 'Kitchen appliances and utensils' },
        { name: 'Tools', icon: '🔧', description: 'Tools and equipment' },
        { name: 'Other', icon: '📦', description: 'Other items' },
      ];

      for (const category of defaultCategories) {
        await prisma.category.create({
          data: {
            ...category,
            userId: null,
            isSystem: true,
          },
        });
        console.log(`✅ Created category: ${category.name}`);
      }

      console.log('✅ All default categories created');
    } else {
      console.log('✅ Categories already exist, skipping...');
    }

    // 4. 检查用户数量
    console.log('🔍 Checking users...');
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users`);

    // 5. 检查物品数量
    console.log('🔍 Checking items...');
    const itemCount = await prisma.item.count();
    console.log(`📊 Found ${itemCount} items`);

    console.log('🎉 Production database initialization completed!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${await prisma.category.count()}`);
    console.log(`   - Users: ${await prisma.user.count()}`);
    console.log(`   - Items: ${await prisma.item.count()}`);

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
