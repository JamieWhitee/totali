// src/modules/items/items.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

/**
 * 物品管理模块 - Items management module
 * 包含分类管理和物品管理功能 - Includes categories and items management
 */
@Module({
  imports: [
    DatabaseModule, // 数据库模块，提供 PrismaService - Database module, provides PrismaService
    AuthModule, // 认证模块，提供 AuthGuard - Auth module, provides AuthGuard
  ],
  controllers: [
    CategoriesController, // 分类管理控制器 - Categories controller
    ItemsController, // 物品管理控制器 - Items controller
  ],
  providers: [
    CategoriesService, // 分类管理服务 - Categories service
    ItemsService, // 物品管理服务 - Items service
  ],
  exports: [
    CategoriesService, // 导出供其他模块使用 - Export for other modules
    ItemsService, // 导出供其他模块使用 - Export for other modules
  ],
})
export class ItemsModule {}

