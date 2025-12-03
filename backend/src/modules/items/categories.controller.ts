// src/modules/items/categories.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto, CategoryWithStatsDto } from './dto/category-response.dto';
import { ApiResponseDto } from '../../common/api-response.dto';
import { AuthUser } from '../auth/interface/auth.interface'; // 新增导入

/**
 * 扩展的请求接口 - Extended request interface with user
 */
interface RequestWithUser {
  user: AuthUser;
}

/**
 * 分类管理控制器 - Categories management controller
 */
@ApiTags('Categories - 分类管理')
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * 获取分类列表 - Get categories list
   * GET /categories
   * 注意：此端点不需要认证，返回系统分类。如果已认证，还会返回用户自定义分类。
   */
  @Get()
  @ApiOperation({
    summary: '获取分类列表 - Get categories',
    description: '获取系统预设分类和用户自定义分类 - Get system and user custom categories',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回分类列表 - Successfully returned categories list',
    type: [CategoryWithStatsDto],
  })
  async getCategories(@Request() req: RequestWithUser): Promise<ApiResponseDto<CategoryWithStatsDto[]>> {
    // 如果用户已认证，返回系统分类+用户分类；否则只返回系统分类
    const userId: string = req.user?.id || null;
    this.logger.log(`GET /categories - User: ${userId || 'anonymous'}`);
    return this.categoriesService.getCategories(userId);
  }

  /**
   * 创建分类 - Create category
   * POST /categories
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '创建分类 - Create category',
    description: '创建用户自定义分类 - Create user custom category',
  })
  @ApiResponse({
    status: 201,
    description: '分类创建成功 - Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '分类名称已存在 - Category name already exists',
  })
  async createCategory(@Request() req: RequestWithUser, @Body() createCategoryDto: CreateCategoryDto): Promise<ApiResponseDto<CategoryResponseDto>> {
    const userId: string = req.user.id;
    this.logger.log(`POST /categories - User: ${userId}, Name: ${createCategoryDto.name}`);
    return this.categoriesService.createCategory(userId, createCategoryDto);
  }

  /**
   * 删除分类 - Delete category
   * DELETE /categories/:id
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '删除分类 - Delete category',
    description: '删除用户自定义分类（不能删除系统分类和有关联物品的分类）',
  })
  @ApiResponse({
    status: 200,
    description: '分类删除成功 - Category deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: '系统分类不能删除或分类下有关联物品',
  })
  @ApiResponse({
    status: 403,
    description: '无权删除此分类 - Forbidden to delete this category',
  })
  @ApiResponse({
    status: 404,
    description: '分类不存在 - Category not found',
  })
  async deleteCategory(@Request() req: RequestWithUser, @Param('id') categoryId: string): Promise<ApiResponseDto<null>> {
    const userId: string = req.user.id;
    this.logger.log(`DELETE /categories/${categoryId} - User: ${userId}`);
    return this.categoriesService.deleteCategory(userId, categoryId);
  }

  /**
   * 获取分类统计 - Get category statistics
   * GET /categories/:id/stats
   */
  @Get(':id/stats')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取分类统计 - Get category statistics',
    description: '获取指定分类的统计信息（物品数量等）',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回分类统计 - Successfully returned category stats',
    type: CategoryWithStatsDto,
  })
  @ApiResponse({
    status: 404,
    description: '分类不存在或无权访问 - Category not found or no access',
  })
  async getCategoryStats(@Request() req: RequestWithUser, @Param('id') categoryId: string): Promise<ApiResponseDto<CategoryWithStatsDto>> {
    const userId: string = req.user.id;
    this.logger.log(`GET /categories/${categoryId}/stats - User: ${userId}`);
    return this.categoriesService.getCategoryStats(userId, categoryId);
  }
}
