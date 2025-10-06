/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

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
    console.log('✅ 系统用户创建完成');
  } else {
    console.log('✅ 系统用户已存在');
  }

  // 2. 创建系统预设分类
  const systemCategories = [
    { name: '电子产品', icon: 'laptop' },
    { name: '服装配饰', icon: 'shirt' },
    { name: '生活用品', icon: 'home' },
    { name: '运动健身', icon: 'dumbbell' },
    { name: '书籍文具', icon: 'book' },
    { name: '其他', icon: 'package' },
  ];

  console.log('开始创建系统预设分类...');

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
      console.log(`✅ 创建分类: ${category.name}`);
    } else {
      console.log(`⏭️  分类已存在: ${category.name}`);
    }
  }

  console.log('�� 数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
