import { ApiProperty } from '@nestjs/swagger';

/**
 * 效率分析物品DTO - Efficiency analysis item DTO
 */
export class EfficiencyItemDto {
  @ApiProperty({ description: '物品ID' })
  id: string;

  @ApiProperty({ description: '物品名称' })
  name: string;

  @ApiProperty({ description: '分类图标' })
  categoryIcon: string;

  @ApiProperty({ description: '分类名称' })
  categoryName: string;

  @ApiProperty({ description: '使用效率 (0-1)' })
  usageEfficiency: number;

  @ApiProperty({ description: '日均成本' })
  dailyCost: number;

  @ApiProperty({ description: '已使用天数' })
  daysUsed: number;

  @ApiProperty({ description: '购买价格' })
  purchasePrice: number;
}

/**
 * 效率分析响应DTO - Efficiency analysis response DTO
 */
export class EfficiencyAnalyticsDto {
  @ApiProperty({ description: '最高效物品列表', type: [EfficiencyItemDto] })
  topEfficient: EfficiencyItemDto[];

  @ApiProperty({ description: '最低效物品列表', type: [EfficiencyItemDto] })
  leastEfficient: EfficiencyItemDto[];

  @ApiProperty({ description: '整体使用率 (0-100)' })
  overallUsageRate: number;
}
