// src/modules/items/items.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemQueryDto } from './dto/item-query.dto';
import { ItemWithStatsDto, PaginatedItemsDto } from './dto/item-response.dto';
import { ItemStatistics, UserItemsOverview } from './interfaces/item.interface';
import { EfficiencyAnalyticsDto } from './dto/analytics-response.dto';
import { CategoryEfficiencyComparisonDto } from './dto/category-analytics.dto';
import { TrendAnalyticsDto } from './dto/trend-analytics.dto';
import { ApiResponseDto } from '../../common/api-response.dto';
import { AuthUser } from '../auth/interface/auth.interface';

/**
 * 扩展的请求接口 - Extended request interface with user
 */
interface RequestWithUser {
  user: AuthUser;
}

/**
 * 物品管理控制器 - Items management controller
 * 提供物品的增删改查和统计 API - Provides CRUD and statistics APIs for items
 */
@ApiTags('Items - 物品管理')
@Controller('items')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ItemsController {
  private readonly logger = new Logger(ItemsController.name);

  constructor(private readonly itemsService: ItemsService) {}

  /**
   * 创建物品 - Create item
   * POST /items
   */
  @Post()
  @ApiOperation({
    summary: '创建物品 - Create item',
    description: '创建新物品并关联到指定分类 - Create new item and associate with category',
  })
  @ApiResponse({
    status: 201,
    description: '物品创建成功 - Item created successfully',
    type: ItemWithStatsDto,
  })
  @ApiResponse({
    status: 400,
    description: '分类不存在或参数错误 - Category not found or invalid parameters',
  })
  async create(@Request() req: RequestWithUser, @Body() createItemDto: CreateItemDto): Promise<ApiResponseDto<ItemWithStatsDto>> {
    const userId: string = req.user.id;
    this.logger.log(`POST /items - User: ${userId}, Item: ${createItemDto.name}`);
    return this.itemsService.create(userId, createItemDto);
  }

  /**
   * 获取物品列表 - Get items list
   * GET /items?page=1&limit=20&search=iPhone&categoryId=xxx&status=ACTIVE&sortBy=purchasePrice&sortOrder=desc
   */
  @Get()
  @ApiOperation({
    summary: '获取物品列表 - Get items list',
    description: '支持分页、搜索、排序和筛选 - Supports pagination, search, sorting and filtering',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码 - Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: '每页数量 - Items per page' })
  @ApiQuery({ name: 'search', required: false, example: 'iPhone', description: '搜索关键词 - Search keyword' })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID - Category ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'RETIRED', 'SOLD'], description: '状态 - Status' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['purchasePrice', 'purchaseDate', 'createdAt'], description: '排序字段 - Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: '排序顺序 - Sort order' })
  @ApiResponse({
    status: 200,
    description: '成功返回物品列表 - Successfully returned items list',
    type: PaginatedItemsDto,
  })
  async findAll(@Request() req: RequestWithUser, @Query() query: ItemQueryDto): Promise<ApiResponseDto<PaginatedItemsDto>> {
    const userId: string = req.user.id;
    this.logger.log(`GET /items - User: ${userId}, Query:`, query);
    return this.itemsService.findAll(userId, query);
  }

  /**
   * 获取用户物品概览统计 - Get user items overview
   * GET /items/statistics/overview
   */
  @Get('statistics/overview')
  @ApiOperation({
    summary: '获取物品概览统计 - Get items overview statistics',
    description: '获取用户所有物品的汇总统计 - Get summary statistics for all user items',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回物品概览统计 - Successfully returned overview statistics',
  })
  async getUserItemsOverview(@Request() req: RequestWithUser): Promise<ApiResponseDto<UserItemsOverview>> {
    const userId: string = req.user.id;
    this.logger.log(`GET /items/statistics/overview - User: ${userId}`);
    return this.itemsService.getUserItemsOverview(userId);
  }

  /**
   * 获取效率分析数据 - Get efficiency analytics
   * GET /items/analytics/efficiency
   */
  @Get('analytics/efficiency')
  @ApiOperation({
    summary: '获取效率分析 - Get efficiency analytics',
    description: '获取最高效和最低效物品排行 - Get top and least efficient items ranking',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每个列表的数量限制 - Limit for each list',
    type: Number,
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: '时间范围（天数），0表示全部时间 - Time range in days, 0 means all time',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '成功返回效率分析数据 - Successfully returned efficiency analytics',
    type: EfficiencyAnalyticsDto,
  })
  async getEfficiencyAnalytics(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: number,
    @Query('days') days?: number
  ): Promise<ApiResponseDto<EfficiencyAnalyticsDto>> {
    const userId: string = req.user.id;
    const limitNum = limit ? Number(limit) : 5;
    const daysNum = days ? Number(days) : 0;
    this.logger.log(`GET /items/analytics/efficiency - User: ${userId}, Limit: ${limitNum}, Days: ${daysNum}`);
    return this.itemsService.getEfficiencyAnalytics(userId, limitNum, daysNum);
  }

  /**
   * 获取分类效率对比 - Get category efficiency comparison
   * GET /items/analytics/categories
   */
  @Get('analytics/categories')
  @ApiOperation({
    summary: '获取分类效率对比 - Get category efficiency comparison',
    description: '按分类统计物品效率、价值等信息 - Statistics by category: efficiency, value, etc.',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回分类效率对比数据 - Successfully returned category efficiency comparison',
    type: CategoryEfficiencyComparisonDto,
  })
  async getCategoryEfficiencyComparison(@Request() req: RequestWithUser): Promise<ApiResponseDto<CategoryEfficiencyComparisonDto>> {
    const userId: string = req.user.id;
    this.logger.log(`GET /items/analytics/categories - User: ${userId}`);
    return this.itemsService.getCategoryEfficiencyComparison(userId);
  }

  /**
   * 获取趋势分析数据 - Get trend analytics
   * GET /items/analytics/trend
   */
  @Get('analytics/trend')
  @ApiOperation({
    summary: '获取趋势分析 - Get trend analytics',
    description: '按天统计物品新增和累计数据 - Statistics by day: new items and cumulative data',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: '统计天数，默认30天 - Number of days, default 30',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '成功返回趋势分析数据 - Successfully returned trend analytics',
    type: TrendAnalyticsDto,
  })
  async getTrendAnalytics(@Request() req: RequestWithUser, @Query('days') days?: number): Promise<ApiResponseDto<TrendAnalyticsDto>> {
    const userId: string = req.user.id;
    const daysNum = days ? Number(days) : 30;
    this.logger.log(`GET /items/analytics/trend - User: ${userId}, Days: ${daysNum}`);
    return this.itemsService.getTrendAnalytics(userId, daysNum);
  }

  /**
   * 获取物品详情 - Get item details
   * GET /items/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取物品详情 - Get item details',
    description: '获取指定物品的详细信息和统计数据 - Get detailed info and statistics for specific item',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回物品详情 - Successfully returned item details',
    type: ItemWithStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: '物品不存在或已删除 - Item not found or deleted',
  })
  async findOne(@Request() req: RequestWithUser, @Param('id') itemId: string): Promise<ApiResponseDto<ItemWithStatsDto>> {
    const userId: string = req.user.id;
    this.logger.log(`GET /items/${itemId} - User: ${userId}`);
    return this.itemsService.findOne(userId, itemId);
  }

  /**
   * 获取物品统计 - Get item statistics
   * GET /items/:id/statistics
   */
  @Get(':id/statistics')
  @ApiOperation({
    summary: '获取物品统计 - Get item statistics',
    description: '获取物品的详细统计信息（包含使用记录分析）',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回物品统计 - Successfully returned item statistics',
  })
  @ApiResponse({
    status: 404,
    description: '物品不存在或已删除 - Item not found or deleted',
  })
  async getItemStatistics(@Request() req: RequestWithUser, @Param('id') itemId: string): Promise<ApiResponseDto<ItemStatistics>> {
    const userId: string = req.user.id;
    this.logger.log(`GET /items/${itemId}/statistics - User: ${userId}`);
    return this.itemsService.getItemStatistics(userId, itemId);
  }

  /**
   * 更新物品 - Update item
   * PATCH /items/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: '更新物品 - Update item',
    description: '更新物品信息（部分更新）- Update item information (partial update)',
  })
  @ApiResponse({
    status: 200,
    description: '物品更新成功 - Item updated successfully',
    type: ItemWithStatsDto,
  })
  @ApiResponse({
    status: 400,
    description: '参数错误 - Invalid parameters',
  })
  @ApiResponse({
    status: 404,
    description: '物品不存在或已删除 - Item not found or deleted',
  })
  async update(
    @Request() req: RequestWithUser,
    @Param('id') itemId: string,
    @Body() updateItemDto: UpdateItemDto
  ): Promise<ApiResponseDto<ItemWithStatsDto>> {
    const userId: string = req.user.id;
    this.logger.log(`PATCH /items/${itemId} - User: ${userId}`);
    return this.itemsService.update(userId, itemId, updateItemDto);
  }

  /**
   * 删除物品 - Delete item
   * DELETE /items/:id
   */
  @Delete(':id')
  @ApiOperation({
    summary: '删除物品 - Delete item',
    description: '软删除物品（不会真正删除，可恢复）- Soft delete item (can be restored)',
  })
  @ApiResponse({
    status: 200,
    description: '物品删除成功 - Item deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: '物品不存在或已删除 - Item not found or deleted',
  })
  async delete(@Request() req: RequestWithUser, @Param('id') itemId: string): Promise<ApiResponseDto<null>> {
    const userId: string = req.user.id;
    this.logger.log(`DELETE /items/${itemId} - User: ${userId}`);
    return this.itemsService.delete(userId, itemId);
  }
}
