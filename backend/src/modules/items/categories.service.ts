// src/modules/items/categories.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto, CategoryWithStatsDto } from './dto/category-response.dto';
import { createSuccessResponse, ApiResponseDto } from '../../common/api-response.dto';

/**
 * 分类管理服务 - Categories management service
 */
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('CategoriesService initialized');
  }

  /**
   * 获取用户分类列表 - Get user categories
   * 包含系统预设分类和用户自定义分类 - Includes system categories and user custom categories
   */
  async getCategories(userId: string): Promise<ApiResponseDto<CategoryWithStatsDto[]>> {
    try {
      this.logger.log(`Getting categories for user: ${userId}`);

      // 查询分类：系统预设 OR 用户创建的
      const categories = await this.prisma.category.findMany({
        where: {
          OR: [
            { isSystem: true }, // 系统预设分类（所有人可见）
            { userId, isSystem: false }, // 用户自己创建的分类
          ],
        },
        include: {
          _count: {
            select: { items: true }, // 统计该分类下的物品数量
          },
        },
        orderBy: [
          { isSystem: 'desc' }, // 系统分类排在前面
          { createdAt: 'asc' }, // 按创建时间升序
        ],
      });

      // 转换为响应 DTO
      const categoriesWithStats: CategoryWithStatsDto[] = categories.map(category => ({
        id: category.id,
        userId: category.userId,
        name: category.name,
        icon: category.icon,
        isSystem: category.isSystem,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        itemCount: category._count.items,
      }));

      return createSuccessResponse(categoriesWithStats, `Found ${categoriesWithStats.length} categories`);
    } catch (error) {
      this.logger.error('Failed to get categories:', error);
      throw error;
    }
  }

  /**
   * 创建自定义分类 - Create custom category
   */
  async createCategory(userId: string, dto: CreateCategoryDto): Promise<ApiResponseDto<CategoryResponseDto>> {
    try {
      this.logger.log(`Creating category for user ${userId}: ${dto.name}`);

      // 检查是否已存在同名分类（同一用户下）
      const existingCategory = await this.prisma.category.findUnique({
        where: {
          userId_name: {
            userId,
            name: dto.name,
          },
        },
      });

      if (existingCategory) {
        throw new BadRequestException(`分类 "${dto.name}" 已存在`);
      }

      // 创建新分类
      const category = await this.prisma.category.create({
        data: {
          userId,
          name: dto.name,
          icon: dto.icon,
          isSystem: false, // 用户创建的分类不是系统预设
        },
      });

      return createSuccessResponse(category, 'Category created successfully');
    } catch (error) {
      this.logger.error('Failed to create category:', error);
      throw error;
    }
  }

  /**
   * 删除分类 - Delete category
   * 只能删除自己创建的非系统分类 - Can only delete own non-system categories
   */
  async deleteCategory(userId: string, categoryId: string): Promise<ApiResponseDto<null>> {
    try {
      this.logger.log(`Deleting category ${categoryId} for user ${userId}`);

      // 查找分类
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });

      // 检查分类是否存在
      if (!category) {
        throw new NotFoundException('分类不存在');
      }

      // 检查是否为系统预设分类
      if (category.isSystem) {
        throw new BadRequestException('系统预设分类不能删除');
      }

      // 检查是否为当前用户的分类
      if (category.userId !== userId) {
        throw new ForbiddenException('无权删除此分类');
      }

      // 检查是否有关联的物品
      if (category._count.items > 0) {
        throw new BadRequestException(`该分类下还有 ${category._count.items} 个物品，无法删除`);
      }

      // 执行删除
      await this.prisma.category.delete({
        where: { id: categoryId },
      });

      return createSuccessResponse(null, 'Category deleted successfully');
    } catch (error) {
      this.logger.error('Failed to delete category:', error);
      throw error;
    }
  }

  /**
   * 获取分类统计信息 - Get category statistics
   */
  async getCategoryStats(userId: string, categoryId: string): Promise<ApiResponseDto<CategoryWithStatsDto>> {
    try {
      this.logger.log(`Getting stats for category ${categoryId}`);

      const category = await this.prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [
            { isSystem: true }, // 系统分类
            { userId, isSystem: false }, // 用户自己的分类
          ],
        },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('分类不存在或无权访问');
      }

      const statsDto: CategoryWithStatsDto = {
        id: category.id,
        userId: category.userId,
        name: category.name,
        icon: category.icon,
        isSystem: category.isSystem,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        itemCount: category._count.items,
      };

      return createSuccessResponse(statsDto, 'Category stats retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get category stats:', error);
      throw error;
    }
  }
}
