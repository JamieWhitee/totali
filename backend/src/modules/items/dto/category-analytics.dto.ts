import { ApiProperty } from '@nestjs/swagger';

/**
 * 分类效率统计DTO - Category efficiency statistics DTO
 */
export class CategoryEfficiencyDto {
  @ApiProperty({ description: '分类ID' })
  categoryId: string;

  @ApiProperty({ description: '分类名称' })
  categoryName: string;

  @ApiProperty({ description: '分类图标' })
  categoryIcon: string;

  @ApiProperty({ description: '物品数量' })
  itemCount: number;

  @ApiProperty({ description: '平均使用效率 (0-1)' })
  averageEfficiency: number;

  @ApiProperty({ description: '总价值' })
  totalValue: number;

  @ApiProperty({ description: '平均日均成本' })
  averageDailyCost: number;
}

/**
 * 分类效率对比响应DTO - Category efficiency comparison response DTO
 */
export class CategoryEfficiencyComparisonDto {
  @ApiProperty({ description: '分类效率列表', type: [CategoryEfficiencyDto] })
  categories: CategoryEfficiencyDto[];
}
