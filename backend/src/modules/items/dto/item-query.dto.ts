// src/modules/items/dto/item-query.dto.ts
import { IsOptional, IsString, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ItemStatus } from './update-item.dto';

/**
 * 排序字段枚举 - Sort field enum
 */
export enum ItemSortBy {
  PURCHASE_PRICE = 'purchasePrice',
  PURCHASE_DATE = 'purchaseDate',
  CREATED_AT = 'createdAt',
}

/**
 * 排序顺序枚举 - Sort order enum
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 物品查询参数 DTO - Item query parameters DTO
 */
export class ItemQueryDto {
  @ApiPropertyOptional({
    description: '页码 - Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量 - Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: '搜索关键词（物品名称）- Search keyword (item name)',
    example: 'iPhone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '分类ID筛选 - Filter by category ID',
    example: 'sys-电子产品',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: '状态筛选 - Filter by status',
    enum: ItemStatus,
    example: ItemStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional({
    description: '排序字段 - Sort by field',
    enum: ItemSortBy,
    example: ItemSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ItemSortBy)
  sortBy?: ItemSortBy = ItemSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: '排序顺序 - Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
