/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient, ItemStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');

  // 1. 创建系统用户（如果不存在）
  const systemUserId = 'system-user-00000000-0000-0000-0000-000000000000';

  const existingSystemUser = await prisma.user.findUnique({
    where: { id: systemUserId },
  });

  if (!existingSystemUser) {
    await prisma.user.create({
      data: {
        id: systemUserId,
        email: 'system@totali.app',
        name: 'System',
        avatarUrl: null,
      },
    });
    console.log('✅ System user created');
  } else {
    console.log('✅ System user already exists');
  }

  // 2. 创建系统预设分类
  const systemCategories = [
    { name: 'Electronics', icon: 'laptop' },
    { name: 'Clothing', icon: 'shirt' },
    { name: 'Home & Living', icon: 'home' },
    { name: 'Sports & Fitness', icon: 'dumbbell' },
    { name: 'Books & Stationery', icon: 'book' },
    { name: 'Others', icon: 'package' },
  ];

  console.log('Creating system categories...');

  for (const category of systemCategories) {
    // 检查分类是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: `sys-${category.name}` },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          id: `sys-${category.name}`,
          userId: systemUserId, // 使用系统用户ID
          name: category.name,
          icon: category.icon,
          isSystem: true,
        },
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name}`);
    }
  }

  // 3. 创建测试用户（可选）
  const testUserId = '00000000-0000-0000-0000-000000000001';
  console.log('Checking test user...');

  const existingTestUser = await prisma.user.findUnique({
    where: { id: testUserId },
  });

  if (!existingTestUser) {
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test@totali.app',
        name: 'Test User',
        avatarUrl: null,
      },
    });
    console.log('✅ Test user created');

    // 4. 为测试用户创建测试数据
    console.log('Creating test items...');

    // 获取分类
    const electronicsCategory = await prisma.category.findFirst({
      where: { name: 'Electronics', userId: systemUserId },
    });
    const clothingCategory = await prisma.category.findFirst({
      where: { name: 'Clothing', userId: systemUserId },
    });
    const homeCategory = await prisma.category.findFirst({
      where: { name: 'Home & Living', userId: systemUserId },
    });
    const sportsCategory = await prisma.category.findFirst({
      where: { name: 'Sports & Fitness', userId: systemUserId },
    });
    const booksCategory = await prisma.category.findFirst({
      where: { name: 'Books & Stationery', userId: systemUserId },
    });

    // 测试物品数据
    const testItems = [
      // Electronics
      {
        name: 'iPhone 15 Pro',
        categoryId: electronicsCategory?.id,
        purchasePrice: 7999,
        purchaseDate: new Date('2024-10-01'),
        expectedLife: 1095, // 3 years
        status: ItemStatus.ACTIVE,
        notes: 'Primary phone for daily use',
      },
      {
        name: 'MacBook Pro 14',
        categoryId: electronicsCategory?.id,
        purchasePrice: 15999,
        purchaseDate: new Date('2024-08-15'),
        expectedLife: 1825, // 5 years
        status: ItemStatus.ACTIVE,
        notes: 'Work laptop',
      },
      {
        name: 'AirPods Pro 2',
        categoryId: electronicsCategory?.id,
        purchasePrice: 1899,
        purchaseDate: new Date('2024-09-10'),
        expectedLife: 730, // 2 years
        status: ItemStatus.ACTIVE,
        notes: 'Commute earphones',
      },
      {
        name: 'iPad Air',
        categoryId: electronicsCategory?.id,
        purchasePrice: 4599,
        purchaseDate: new Date('2023-12-01'),
        expectedLife: 1460, // 4 years
        status: ItemStatus.ACTIVE,
        notes: 'Reading and note-taking',
      },
      // Clothing
      {
        name: 'Nike Air Max 270',
        categoryId: clothingCategory?.id,
        purchasePrice: 1299,
        purchaseDate: new Date('2024-07-20'),
        expectedLife: 365, // 1 year
        status: ItemStatus.ACTIVE,
        notes: 'Daily sneakers',
      },
      {
        name: 'Uniqlo Down Jacket',
        categoryId: clothingCategory?.id,
        purchasePrice: 799,
        purchaseDate: new Date('2023-11-15'),
        expectedLife: 1095, // 3 years
        status: ItemStatus.ACTIVE,
        notes: 'Winter coat',
      },
      // Home & Living
      {
        name: 'Dyson V12 Vacuum',
        categoryId: homeCategory?.id,
        purchasePrice: 3990,
        purchaseDate: new Date('2024-06-01'),
        expectedLife: 1825, // 5 years
        status: ItemStatus.ACTIVE,
        notes: 'Home cleaning',
      },
      {
        name: 'Xiaomi Air Purifier',
        categoryId: homeCategory?.id,
        purchasePrice: 899,
        purchaseDate: new Date('2024-03-15'),
        expectedLife: 1460, // 4 years
        status: ItemStatus.ACTIVE,
        notes: 'Bedroom use',
      },
      // Sports & Fitness
      {
        name: 'Keep Yoga Mat',
        categoryId: sportsCategory?.id,
        purchasePrice: 199,
        purchaseDate: new Date('2024-05-10'),
        expectedLife: 730, // 2 years
        status: ItemStatus.ACTIVE,
        notes: 'Home workout',
      },
      {
        name: 'Dumbbell Set 20kg',
        categoryId: sportsCategory?.id,
        purchasePrice: 299,
        purchaseDate: new Date('2024-04-01'),
        expectedLife: 3650, // 10 years
        status: ItemStatus.ACTIVE,
        notes: 'Strength training',
      },
      // Books & Stationery
      {
        name: 'Code Complete',
        categoryId: booksCategory?.id,
        purchasePrice: 128,
        purchaseDate: new Date('2024-02-14'),
        expectedLife: 3650, // 10 years
        status: ItemStatus.ACTIVE,
        notes: 'Technical book',
      },
      {
        name: 'Moleskine Notebook',
        categoryId: booksCategory?.id,
        purchasePrice: 158,
        purchaseDate: new Date('2024-01-05'),
        expectedLife: 365, // 1 year
        status: ItemStatus.RETIRED,
        notes: 'Used up',
      },
      // Sold items
      {
        name: 'iPhone 12',
        categoryId: electronicsCategory?.id,
        purchasePrice: 6499,
        purchaseDate: new Date('2021-11-01'),
        expectedLife: 1095,
        status: ItemStatus.SOLD,
        soldPrice: 2500,
        soldDate: new Date('2024-10-01'),
        notes: 'Upgraded to iPhone 15 Pro',
      },
    ];

    let createdCount = 0;
    for (const itemData of testItems) {
      if (itemData.categoryId) {
        await prisma.item.create({
          data: {
            ...itemData,
            userId: testUserId,
          },
        });
        createdCount++;
        console.log(`✅ Created item: ${itemData.name}`);
      }
    }

    console.log(`📊 Created ${createdCount} test items in total`);

    // 5. 创建一些使用记录
    console.log('Creating usage records...');

    const items = await prisma.item.findMany({
      where: { userId: testUserId, status: ItemStatus.ACTIVE },
      take: 5,
    });

    let recordCount = 0;
    const today = new Date();

    for (const item of items) {
      // 为每个物品创建最近30天的随机使用记录
      for (let i = 0; i < 30; i++) {
        const usageDate = new Date(today);
        usageDate.setDate(usageDate.getDate() - i);

        // 随机决定是否使用（70%概率）
        if (Math.random() > 0.3) {
          try {
            await prisma.usageRecord.create({
              data: {
                userId: testUserId,
                itemId: item.id,
                usageDate: usageDate,
              },
            });
            recordCount++;
          } catch (error) {
            // 忽略重复记录错误
          }
        }
      }
    }

    console.log(`✅ Created ${recordCount} usage records`);
  } else {
    console.log('⏭️  Test user already exists, skipping test data creation');
  }

  console.log('🎉 Database initialization completed!');
  console.log('\n📝 Test account info:');
  console.log('  Email: test@totali.app');
  console.log('  User ID: 00000000-0000-0000-0000-000000000001');
  console.log('\n💡 Tip: Please create corresponding auth user in Supabase');
}

main()
  .catch((e) => {
    console.error('❌ Database initialization failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
