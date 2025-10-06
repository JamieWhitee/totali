// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { DatabaseModule } from '../database/database.module';

/**
 * 认证模块 - Authentication module
 * 提供用户认证相关的服务和控制器 - Provides authentication related services and controllers
 */
@Module({
  imports: [
    // 导入数据库模块以使用PrismaService - Import database module to use PrismaService
    DatabaseModule,
  ],
  controllers: [
    // 认证控制器 - Authentication controller
    AuthController,
  ],
  providers: [
    // 认证服务 - Authentication service
    AuthService,
    // 认证守卫 - Authentication guard
    AuthGuard,
  ],
  exports: [
    // 导出认证服务供其他模块使用 - Export auth service for other modules
    AuthService,
    // 导出认证守卫供其他模块使用 - Export auth guard for other modules
    AuthGuard,
  ],
})
export class AuthModule {}
