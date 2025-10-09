// src/modules/items/dto/category-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/**
 * 分类响应数据 - Category response data
 */
export class CategoryResponseDto {
  @ApiProperty({ description: '分类ID - Category ID' })
  id: string;

  @ApiProperty({ description: '用户ID - User ID' })
  userId: string;

  @ApiProperty({ description: '分类名称 - Category name' })
  name: string;

  @ApiProperty({ description: '图标名称 - Icon name', required: false })
  icon: string | null;

  @ApiProperty({ description: '是否为系统预设 - Is system category' })
  isSystem: boolean;

  @ApiProperty({ description: '创建时间 - Created at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间 - Updated at' })
  updatedAt: Date;
}

/**
 * 分类统计数据 - Category with statistics
 */
export class CategoryWithStatsDto extends CategoryResponseDto {
  @ApiProperty({ description: '物品数量 - Item count' })
  itemCount: number;
}
