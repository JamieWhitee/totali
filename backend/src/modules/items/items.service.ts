// src/modules/items/items.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Item, ItemStatus as PrismaItemStatus } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto, ItemStatus } from './dto/update-item.dto';
import { ItemQueryDto } from './dto/item-query.dto';
import { ItemWithStatsDto, PaginatedItemsDto } from './dto/item-response.dto';
import { ItemStatistics, UserItemsOverview } from './interfaces/item.interface';
import { EfficiencyAnalyticsDto, EfficiencyItemDto } from './dto/analytics-response.dto';
import { CategoryEfficiencyComparisonDto, CategoryEfficiencyDto } from './dto/category-analytics.dto';
import { TrendAnalyticsDto, TrendDataPointDto } from './dto/trend-analytics.dto';
import { createSuccessResponse, ApiResponseDto } from '../../common/api-response.dto';
import { differenceInDays, format, subDays, startOfDay } from 'date-fns';

/**
 * 包含分类信息的物品类型 - Item with category type
 */
type ItemWithCategory = Prisma.ItemGetPayload<{
  include: { category: true };
}>;

/**
 * 物品管理服务 - Items management service
 * 负责物品的增删改查和统计计算 - Handles CRUD operations and statistics calculation for items
 */
@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('ItemsService initialized');
  }

  // ==================== 辅助方法 Helper Methods ====================

  /**
   * 安全地转换 Decimal 为 number - Safely convert Decimal to number
   * Prisma 的 Decimal 类型需要转换为 JavaScript 的 number 类型
   */
  private toNumber(value: Prisma.Decimal | number | null): number {
    if (value === null) return 0;
    return typeof value === 'number' ? value : Number(value.toString());
  }

  /**
   * 格式化数字为固定小数位 - Format number to fixed decimals
   * @param value - 要格式化的数字
   * @param decimals - 小数位数，默认2位
   */
  private formatNumber(value: number, decimals: number = 2): number {
    return Number(value.toFixed(decimals));
  }

  /**
   * 计算使用天数 - Calculate days used
   * 从购买日期到今天的天数，最小为0
   */
  private calculateDaysUsed(purchaseDate: Date): number {
    return Math.max(0, differenceInDays(new Date(), purchaseDate));
  }

  /**
   * 转换 Prisma 枚举到 DTO 枚举 - Convert Prisma enum to DTO enum
   * TypeScript 将不同模块的同名枚举视为不同类型，需要显式转换
   */
  private convertItemStatus(status: PrismaItemStatus): ItemStatus {
    switch (status) {
      case PrismaItemStatus.ACTIVE:
        return ItemStatus.ACTIVE;
      case PrismaItemStatus.RETIRED:
        return ItemStatus.RETIRED;
      case PrismaItemStatus.SOLD:
        return ItemStatus.SOLD;
      default:
        return ItemStatus.ACTIVE;
    }
  }

  /**
   * 计算物品统计数据 - Calculate item statistics
   * 将数据库物品数据转换为包含统计信息的 DTO
   * @param item - 包含分类信息的物品数据
   * @returns 包含统计数据的物品 DTO
   */
  private calculateItemStats(item: ItemWithCategory): ItemWithStatsDto {
    // 计算使用天数 - Calculate days used
    const daysUsed = this.calculateDaysUsed(item.purchaseDate);

    // 转换价格为 number 类型 - Convert price to number
    const purchasePrice = this.toNumber(item.purchasePrice);

    // 计算日均成本 = 购买价格 / 使用天数 - Calculate daily cost = purchase price / days used
    const dailyCost = daysUsed > 0 ? purchasePrice / daysUsed : purchasePrice;

    // 计算使用效率 = (实际使用天数 / 预计使用天数) * 100% - Calculate usage efficiency
    const usageEfficiency = item.expectedLife ? (daysUsed / item.expectedLife) * 100 : null;

    return {
      id: item.id,
      userId: item.userId,
      categoryId: item.categoryId,
      name: item.name,
      purchasePrice,
      purchaseDate: item.purchaseDate,
      expectedLife: item.expectedLife,
      status: this.convertItemStatus(item.status),
      notes: item.notes,
      imageUrl: item.imageUrl,
      soldPrice: item.soldPrice ? this.toNumber(item.soldPrice) : null,
      soldDate: item.soldDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
      category: item.category,
      daysUsed,
      dailyCost: this.formatNumber(dailyCost),
      usageEfficiency: usageEfficiency ? this.formatNumber(usageEfficiency) : null,
    };
  }

  // ==================== CRUD 方法 CRUD Methods ====================

  /**
   * 创建物品 - Create item
   * @param userId - 用户ID
   * @param dto - 创建物品的数据传输对象
   * @returns 创建成功的物品（包含统计数据）
   */
  async create(userId: string, dto: CreateItemDto): Promise<ApiResponseDto<ItemWithStatsDto>> {
    try {
      this.logger.log(`Creating item for user ${userId}: ${dto.name}`);

      // 验证分类是否存在且用户有权访问 - Validate category exists and user has access
      // 系统预设分类或用户自己创建的分类都可以使用
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          OR: [
            { isSystem: true }, // 系统预设分类 - System categories
            { userId, isSystem: false }, // 用户自定义分类 - User custom categories
          ],
        },
      });

      if (!category) {
        throw new BadRequestException('分类不存在或无权访问');
      }

      // 创建物品并关联分类 - Create item with category relation
      const item = await this.prisma.item.create({
        data: {
          userId,
          categoryId: dto.categoryId,
          name: dto.name,
          purchasePrice: dto.purchasePrice,
          purchaseDate: dto.purchaseDate,
          expectedLife: dto.expectedLife,
          notes: dto.notes,
          imageUrl: dto.imageUrl,
        },
        include: {
          category: true, // 包含分类信息 - Include category info
        },
      });

      // 计算统计数据并返回 - Calculate statistics and return
      const itemWithStats = this.calculateItemStats(item);

      return createSuccessResponse(itemWithStats, 'Item created successfully');
    } catch (error) {
      this.logger.error('Failed to create item:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 获取物品列表（支持分页、搜索、排序）- Get items list with pagination, search, and sorting
   * @param userId - 用户ID
   * @param query - 查询参数（分页、搜索、排序、筛选）
   * @returns 分页的物品列表
   */
  async findAll(userId: string, query: ItemQueryDto): Promise<ApiResponseDto<PaginatedItemsDto>> {
    try {
      const { page = 1, limit = 20, search, categoryId, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      this.logger.log(`Getting items for user ${userId} - Page: ${page}, Limit: ${limit}`);

      // 构建查询条件 - Build where condition
      const whereCondition: Prisma.ItemWhereInput = {
        userId, // 只查询当前用户的物品 - Only current user's items
        deletedAt: null, // 排除已删除的物品 - Exclude deleted items
        // 搜索条件：物品名称包含关键词（不区分大小写）- Search: item name contains keyword (case insensitive)
        ...(search && {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }),
        // 分类筛选 - Filter by category
        ...(categoryId && { categoryId }),
        // 状态筛选 - Filter by status
        ...(status && { status }),
      };

      // 并行查询物品列表和总数（提升性能）- Query items and total count in parallel (performance optimization)
      const [items, total] = await Promise.all([
        this.prisma.item.findMany({
          where: whereCondition,
          include: {
            category: true,
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip: (page - 1) * limit, // 跳过前N条记录 - Skip first N records
          take: limit, // 取M条记录 - Take M records
        }),
        this.prisma.item.count({
          where: whereCondition,
        }),
      ]);

      // 为每个物品计算统计数据 - Calculate statistics for each item
      const itemsWithStats: ItemWithStatsDto[] = items.map((item: ItemWithCategory) => this.calculateItemStats(item));

      // 构建分页响应 - Build paginated response
      const paginatedResult: PaginatedItemsDto = {
        items: itemsWithStats,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit), // 总页数 = 向上取整(总数 / 每页数量) - Total pages
      };

      return createSuccessResponse(paginatedResult, `Found ${total} items`);
    } catch (error) {
      this.logger.error('Failed to get items:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 获取物品详情 - Get item by ID
   * @param userId - 用户ID
   * @param itemId - 物品ID
   * @returns 物品详情（包含统计数据）
   */
  async findOne(userId: string, itemId: string): Promise<ApiResponseDto<ItemWithStatsDto>> {
    try {
      this.logger.log(`Getting item ${itemId} for user ${userId}`);

      // 查询物品，验证所有权和未删除状态 - Query item, validate ownership and non-deleted status
      const item = await this.prisma.item.findFirst({
        where: {
          id: itemId,
          userId, // 确保是当前用户的物品 - Ensure it's current user's item
          deletedAt: null, // 确保未被删除 - Ensure not deleted
        },
        include: {
          category: true,
        },
      });

      if (!item) {
        throw new NotFoundException('物品不存在或已删除');
      }

      // 计算统计数据 - Calculate statistics
      const itemWithStats = this.calculateItemStats(item);

      return createSuccessResponse(itemWithStats, 'Item retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get item:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 更新物品 - Update item
   * @param userId - 用户ID
   * @param itemId - 物品ID
   * @param dto - 更新数据
   * @returns 更新后的物品（包含统计数据）
   */
  async update(userId: string, itemId: string, dto: UpdateItemDto): Promise<ApiResponseDto<ItemWithStatsDto>> {
    try {
      this.logger.log(`Updating item ${itemId} for user ${userId}`);

      // 检查物品是否存在且属于当前用户 - Check if item exists and belongs to current user
      const existingItem = await this.prisma.item.findFirst({
        where: {
          id: itemId,
          userId,
          deletedAt: null,
        },
      });

      if (!existingItem) {
        throw new NotFoundException('物品不存在或已删除');
      }

      // 如果更新了分类，验证新分类是否有效 - If category is updated, validate new category
      if (dto.categoryId && dto.categoryId !== existingItem.categoryId) {
        const category = await this.prisma.category.findFirst({
          where: {
            id: dto.categoryId,
            OR: [{ isSystem: true }, { userId, isSystem: false }],
          },
        });

        if (!category) {
          throw new BadRequestException('分类不存在或无权访问');
        }
      }

      // 更新物品（只更新提供的字段）- Update item (only provided fields)
      const updatedItem = await this.prisma.item.update({
        where: { id: itemId },
        data: {
          // 使用条件扩展运算符，只在字段不为 undefined 时更新
          // Use conditional spread, only update if field is not undefined
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.purchasePrice !== undefined && { purchasePrice: dto.purchasePrice }),
          ...(dto.purchaseDate !== undefined && { purchaseDate: dto.purchaseDate }),
          ...(dto.expectedLife !== undefined && { expectedLife: dto.expectedLife }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.soldPrice !== undefined && { soldPrice: dto.soldPrice }),
          ...(dto.soldDate !== undefined && { soldDate: dto.soldDate }),
          updatedAt: new Date(),
        },
        include: {
          category: true,
        },
      });

      // 计算统计数据并返回 - Calculate statistics and return
      const itemWithStats = this.calculateItemStats(updatedItem);

      return createSuccessResponse(itemWithStats, 'Item updated successfully');
    } catch (error) {
      this.logger.error('Failed to update item:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 删除物品（软删除）- Delete item (soft delete)
   * 不真正删除记录，只设置 deletedAt 字段
   * @param userId - 用户ID
   * @param itemId - 物品ID
   */
  async delete(userId: string, itemId: string): Promise<ApiResponseDto<null>> {
    try {
      this.logger.log(`Deleting item ${itemId} for user ${userId}`);

      // 检查物品是否存在且属于当前用户 - Check if item exists and belongs to current user
      const item = await this.prisma.item.findFirst({
        where: {
          id: itemId,
          userId,
          deletedAt: null,
        },
      });

      if (!item) {
        throw new NotFoundException('物品不存在或已删除');
      }

      // 软删除：设置 deletedAt 字段 - Soft delete: set deletedAt field
      // 好处：可以恢复数据，保留历史记录 - Benefits: can restore data, keep history
      await this.prisma.item.update({
        where: { id: itemId },
        data: {
          deletedAt: new Date(),
        },
      });

      return createSuccessResponse(null, 'Item deleted successfully');
    } catch (error) {
      this.logger.error('Failed to delete item:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // ==================== 统计方法 Statistics Methods ====================

  /**
   * 获取物品详细统计 - Get item detailed statistics
   * 包含使用记录分析 - Includes usage records analysis
   * @param userId - 用户ID
   * @param itemId - 物品ID
   * @returns 物品详细统计数据
   */
  async getItemStatistics(userId: string, itemId: string): Promise<ApiResponseDto<ItemStatistics>> {
    try {
      this.logger.log(`Getting statistics for item ${itemId}`);

      // 查询物品及其使用记录 - Query item with usage records
      const item = await this.prisma.item.findFirst({
        where: {
          id: itemId,
          userId,
          deletedAt: null,
        },
        include: {
          usageRecords: {
            orderBy: {
              usageDate: 'desc', // 按使用日期倒序 - Order by usage date descending
            },
          },
        },
      });

      if (!item) {
        throw new NotFoundException('物品不存在或已删除');
      }

      // 基础统计计算 - Basic statistics calculation
      const daysUsed = this.calculateDaysUsed(item.purchaseDate);
      const purchasePrice = this.toNumber(item.purchasePrice);

      // 日均成本 = 购买价格 / 使用天数 - Daily cost = purchase price / days used
      const dailyCost = daysUsed > 0 ? purchasePrice / daysUsed : purchasePrice;

      // 当前价值：如果已卖出使用卖出价，否则按折旧计算
      // Current value: use sold price if sold, otherwise calculate by depreciation
      const currentValue = item.soldPrice ? this.toNumber(item.soldPrice) : purchasePrice * (1 - daysUsed / (item.expectedLife || 365));

      // 使用频率 = (使用记录数 / 使用天数) * 100% - Usage frequency
      const usageFrequency = item.usageRecords.length > 0 ? (item.usageRecords.length / daysUsed) * 100 : 0;

      // 使用效率 = (实际使用天数 / 预计使用天数) * 100% - Usage efficiency
      const usageEfficiency = item.expectedLife ? (daysUsed / item.expectedLife) * 100 : null;

      const statistics: ItemStatistics = {
        itemId: item.id,
        itemName: item.name,
        daysUsed,
        dailyCost: this.formatNumber(dailyCost),
        totalValue: purchasePrice,
        currentValue: this.formatNumber(currentValue),
        usageFrequency: this.formatNumber(usageFrequency),
        usageEfficiency: usageEfficiency ? this.formatNumber(usageEfficiency) : null,
      };

      return createSuccessResponse(statistics, 'Item statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get item statistics:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 获取用户物品概览 - Get user items overview
   * 包含总体统计数据 - Includes overall statistics
   * @param userId - 用户ID
   * @returns 用户物品概览统计
   */
  async getUserItemsOverview(userId: string): Promise<ApiResponseDto<UserItemsOverview>> {
    try {
      this.logger.log(`Getting items overview for user ${userId}`);

      // 获取所有未删除的物品 - Get all non-deleted items
      const items = await this.prisma.item.findMany({
        where: {
          userId,
          deletedAt: null,
        },
      });

      const totalItems = items.length;

      // 计算总价值：所有物品购买价格之和 - Calculate total value: sum of all purchase prices
      const totalValue = items.reduce((sum: number, item: Item) => {
        return sum + this.toNumber(item.purchasePrice);
      }, 0);

      // 计算平均日成本 - Calculate average daily cost
      let totalDailyCost = 0;
      items.forEach((item: Item) => {
        const daysUsed = this.calculateDaysUsed(item.purchaseDate);
        // 每个物品的日均成本 - Daily cost for each item
        const dailyCost = daysUsed > 0 ? this.toNumber(item.purchasePrice) / daysUsed : 0;
        totalDailyCost += dailyCost;
      });
      const averageDailyCost = totalItems > 0 ? totalDailyCost / totalItems : 0;

      // 按状态统计物品数量 - Count items by status
      const activeItems = items.filter((item: Item) => item.status === PrismaItemStatus.ACTIVE).length;
      const retiredItems = items.filter((item: Item) => item.status === PrismaItemStatus.RETIRED).length;
      const soldItems = items.filter((item: Item) => item.status === PrismaItemStatus.SOLD).length;

      const overview: UserItemsOverview = {
        totalItems,
        totalValue: this.formatNumber(totalValue),
        averageDailyCost: this.formatNumber(averageDailyCost),
        activeItems,
        retiredItems,
        soldItems,
      };

      return createSuccessResponse(overview, 'User items overview retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get user items overview:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 获取效率分析数据 - Get efficiency analytics
   * 包含最高效和最低效物品排行 - Includes top and least efficient items ranking
   * @param userId - 用户ID
   * @param limit - 每个列表的数量限制，默认5
   * @param days - 时间范围（天数），默认0表示全部时间
   * @returns 效率分析数据
   */
  async getEfficiencyAnalytics(userId: string, limit = 5, days = 0): Promise<ApiResponseDto<EfficiencyAnalyticsDto>> {
    try {
      this.logger.log(`Getting efficiency analytics for user ${userId}, days: ${days}`);

      // 计算时间范围的起始日期 - Calculate start date for time range
      const timeRangeStart = days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

      // 构建查询条件 - Build query conditions
      const whereCondition: Prisma.ItemWhereInput = {
        userId,
        deletedAt: null,
        // 如果指定了时间范围，只包含在此期间购买的物品 - Filter by purchase date if time range specified
        ...(timeRangeStart && {
          purchaseDate: {
            gte: timeRangeStart,
          },
        }),
      };

      // 获取符合条件的物品（包含分类信息）- Get items matching conditions with category info
      const items = await this.prisma.item.findMany({
        where: whereCondition,
        include: {
          category: true,
        },
      });

      // 计算每个物品的效率数据 - Calculate efficiency data for each item
      const itemsWithEfficiency: EfficiencyItemDto[] = items
        .map((item: ItemWithCategory) => {
          const daysUsed = this.calculateDaysUsed(item.purchaseDate);
          const purchasePrice = this.toNumber(item.purchasePrice);
          const dailyCost = daysUsed > 0 ? purchasePrice / daysUsed : purchasePrice;

          // 计算使用效率：如果有预期寿命，使用实际使用天数/预期天数；否则使用默认值0.5
          // Calculate usage efficiency: if expectedLife exists, use daysUsed/expectedLife; otherwise default 0.5
          let usageEfficiency = 0.5; // 默认中等效率 - Default medium efficiency
          if (item.expectedLife && item.expectedLife > 0) {
            usageEfficiency = Math.min(daysUsed / item.expectedLife, 1.0); // 最大为1.0
          }

          return {
            id: item.id,
            name: item.name,
            categoryIcon: item.category?.icon || '📦',
            categoryName: item.category?.name || '未分类',
            usageEfficiency: this.formatNumber(usageEfficiency),
            dailyCost: this.formatNumber(dailyCost),
            daysUsed,
            purchasePrice: this.formatNumber(purchasePrice),
          };
        })
        .filter((item: EfficiencyItemDto) => item.daysUsed > 0); // 过滤掉刚购买的物品

      // 按使用效率降序排序 - Sort by usage efficiency descending
      const sortedByEfficiency = [...itemsWithEfficiency].sort((a: EfficiencyItemDto, b: EfficiencyItemDto) => b.usageEfficiency - a.usageEfficiency);

      // 获取最高效物品 Top N - Get top N most efficient items
      const topEfficient = sortedByEfficiency.slice(0, limit);

      // 获取最低效物品 Top N - Get top N least efficient items
      const leastEfficient = sortedByEfficiency.slice(-limit).reverse();

      // 计算整体使用率 - Calculate overall usage rate
      const totalEfficiency = itemsWithEfficiency.reduce((sum: number, item: EfficiencyItemDto) => sum + item.usageEfficiency, 0);
      const overallUsageRate = itemsWithEfficiency.length > 0 ? (totalEfficiency / itemsWithEfficiency.length) * 100 : 0;

      const analytics: EfficiencyAnalyticsDto = {
        topEfficient,
        leastEfficient,
        overallUsageRate: this.formatNumber(overallUsageRate),
      };

      return createSuccessResponse(analytics, 'Efficiency analytics retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get efficiency analytics:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 获取分类效率对比 - Get category efficiency comparison
   * 按分类统计物品效率、价值等信息 - Statistics by category: efficiency, value, etc.
   * @param userId - 用户ID
   * @returns 分类效率对比数据
   */
  async getCategoryEfficiencyComparison(userId: string): Promise<ApiResponseDto<CategoryEfficiencyComparisonDto>> {
    try {
      this.logger.log(`Getting category efficiency comparison for user ${userId}`);

      // 获取所有未删除的物品（包含分类信息）- Get all non-deleted items with category info
      const items = await this.prisma.item.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        include: {
          category: true,
        },
      });

      // 按分类分组统计 - Group by category and calculate statistics
      const categoryMap = new Map<
        string,
        {
          categoryId: string;
          categoryName: string;
          categoryIcon: string;
          items: ItemWithCategory[];
        }
      >();

      // 将物品按分类分组 - Group items by category
      items.forEach((item: ItemWithCategory) => {
        const categoryId = item.category?.id || 'uncategorized';
        const categoryName = item.category?.name || '未分类';
        const categoryIcon = item.category?.icon || '📦';

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            categoryIcon,
            items: [],
          });
        }

        const categoryData = categoryMap.get(categoryId);
        if (categoryData) {
          categoryData.items.push(item);
        }
      });

      // 计算每个分类的统计数据 - Calculate statistics for each category
      const categoryStats: CategoryEfficiencyDto[] = Array.from(categoryMap.values()).map(category => {
        const categoryItems = category.items;
        const itemCount = categoryItems.length;

        // 计算总价值 - Calculate total value
        const totalValue = categoryItems.reduce((sum: number, item: ItemWithCategory) => {
          return sum + this.toNumber(item.purchasePrice);
        }, 0);

        // 计算平均效率和平均日均成本 - Calculate average efficiency and average daily cost
        let totalEfficiency = 0;
        let totalDailyCost = 0;

        categoryItems.forEach((item: ItemWithCategory) => {
          const daysUsed = this.calculateDaysUsed(item.purchaseDate);
          const purchasePrice = this.toNumber(item.purchasePrice);
          const dailyCost = daysUsed > 0 ? purchasePrice / daysUsed : purchasePrice;

          // 计算使用效率
          let usageEfficiency = 0.5;
          if (item.expectedLife && item.expectedLife > 0) {
            usageEfficiency = Math.min(daysUsed / item.expectedLife, 1.0);
          }

          totalEfficiency += usageEfficiency;
          totalDailyCost += dailyCost;
        });

        const averageEfficiency = itemCount > 0 ? totalEfficiency / itemCount : 0;
        const averageDailyCost = itemCount > 0 ? totalDailyCost / itemCount : 0;

        return {
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          categoryIcon: category.categoryIcon,
          itemCount,
          averageEfficiency: this.formatNumber(averageEfficiency),
          totalValue: this.formatNumber(totalValue),
          averageDailyCost: this.formatNumber(averageDailyCost),
        };
      });

      // 按平均效率降序排序 - Sort by average efficiency descending
      const sortedCategories = categoryStats.sort((a, b) => b.averageEfficiency - a.averageEfficiency);

      const comparison: CategoryEfficiencyComparisonDto = {
        categories: sortedCategories,
      };

      return createSuccessResponse(comparison, 'Category efficiency comparison retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get category efficiency comparison:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 获取趋势分析数据 - Get trend analytics
   * 按天统计物品新增和累计数据 - Statistics by day: new items and cumulative data
   * @param userId - 用户ID
   * @param days - 统计天数，默认30天
   * @returns 趋势分析数据
   */
  async getTrendAnalytics(userId: string, days = 30): Promise<ApiResponseDto<TrendAnalyticsDto>> {
    try {
      this.logger.log(`Getting trend analytics for user ${userId}, days: ${days}`);

      // 获取所有未删除的物品 - Get all non-deleted items
      const items = await this.prisma.item.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          purchaseDate: 'asc',
        },
      });

      // 生成日期范围 - Generate date range
      const endDate = startOfDay(new Date());

      // 初始化每一天的数据 - Initialize data for each day
      const dataPointsMap = new Map<string, TrendDataPointDto>();
      for (let i = 0; i < days; i++) {
        const date = startOfDay(subDays(endDate, days - 1 - i));
        const dateStr = format(date, 'yyyy-MM-dd');
        dataPointsMap.set(dateStr, {
          date: dateStr,
          newItems: 0,
          totalItems: 0,
          newItemsValue: 0,
          totalValue: 0,
        });
      }

      // 按天分组物品 - Group items by day
      items.forEach((item: Item) => {
        const purchaseDate = startOfDay(new Date(item.purchaseDate));
        const dateStr = format(purchaseDate, 'yyyy-MM-dd');
        const itemValue = this.toNumber(item.purchasePrice);

        // 如果购买日期在统计范围内，记录为新增 - Record as new if purchase date is in range
        if (dataPointsMap.has(dateStr)) {
          const dataPoint = dataPointsMap.get(dateStr);
          if (dataPoint) {
            dataPoint.newItems += 1;
            dataPoint.newItemsValue += itemValue;
          }
        }

        // 如果购买日期在统计范围开始之前或之内，计入累计 - Add to cumulative if before or within range
        if (purchaseDate <= endDate) {
          const daysInRange = Array.from(dataPointsMap.keys()).filter(date => {
            return new Date(date) >= purchaseDate;
          });

          daysInRange.forEach(date => {
            const dataPoint = dataPointsMap.get(date);
            if (dataPoint) {
              dataPoint.totalItems = (dataPoint.totalItems || 0) + 1;
              dataPoint.totalValue = (dataPoint.totalValue || 0) + itemValue;
            }
          });
        }
      });

      // 转换为数组并排序 - Convert to array and sort
      const dataPoints = Array.from(dataPointsMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(point => ({
          date: point.date,
          newItems: point.newItems,
          totalItems: point.totalItems,
          newItemsValue: this.formatNumber(point.newItemsValue),
          totalValue: this.formatNumber(point.totalValue),
        }));

      const trend: TrendAnalyticsDto = {
        dataPoints,
        days,
      };

      return createSuccessResponse(trend, 'Trend analytics retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get trend analytics:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
