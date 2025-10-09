// src/modules/items/dto/item-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ItemStatus } from './update-item.dto';
import { CategoryResponseDto } from './category-response.dto';

/**
 * 物品响应 DTO - Item response DTO
 */
export class ItemResponseDto {
  @ApiProperty({ description: '物品ID - Item ID' })
  id: string;

  @ApiProperty({ description: '用户ID - User ID' })
  userId: string;

  @ApiProperty({ description: '分类ID - Category ID' })
  categoryId: string;

  @ApiProperty({ description: '物品名称 - Item name' })
  name: string;

  @ApiProperty({ description: '购买价格 - Purchase price' })
  purchasePrice: number;

  @ApiProperty({ description: '购买日期 - Purchase date' })
  purchaseDate: Date;

  @ApiProperty({ description: '预计使用天数 - Expected life', required: false })
  expectedLife: number | null;

  @ApiProperty({ description: '物品状态 - Item status', enum: ItemStatus })
  status: ItemStatus;

  @ApiProperty({ description: '备注 - Notes', required: false })
  notes: string | null;

  @ApiProperty({ description: '图片URL - Image URL', required: false })
  imageUrl: string | null;

  @ApiProperty({ description: '卖出价格 - Sold price', required: false })
  soldPrice: number | null;

  @ApiProperty({ description: '卖出日期 - Sold date', required: false })
  soldDate: Date | null;

  @ApiProperty({ description: '创建时间 - Created at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间 - Updated at' })
  updatedAt: Date;

  @ApiProperty({ description: '删除时间 - Deleted at', required: false })
  deletedAt: Date | null;

  @ApiProperty({ description: '关联的分类信息 - Category info', required: false })
  category?: CategoryResponseDto;
}

/**
 * 物品统计响应 DTO - Item with statistics DTO
 * 包含计算字段
 */
export class ItemWithStatsDto extends ItemResponseDto {
  @ApiProperty({ description: '使用天数 - Days used' })
  daysUsed: number;

  @ApiProperty({ description: '日均成本 - Daily cost' })
  dailyCost: number;

  @ApiProperty({ description: '使用效率（使用天数/预计天数）- Usage efficiency', required: false })
  usageEfficiency: number | null;
}

/**
 * 分页物品列表响应 DTO - Paginated items response DTO
 */
export class PaginatedItemsDto {
  @ApiProperty({ description: '物品列表 - Items list', type: [ItemWithStatsDto] })
  items: ItemWithStatsDto[];

  @ApiProperty({ description: '总数量 - Total count' })
  total: number;

  @ApiProperty({ description: '当前页 - Current page' })
  page: number;

  @ApiProperty({ description: '每页数量 - Items per page' })
  limit: number;

  @ApiProperty({ description: '总页数 - Total pages' })
  totalPages: number;
}
