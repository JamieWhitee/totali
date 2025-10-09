import { ApiProperty } from '@nestjs/swagger';

/**
 * 趋势数据点DTO - Trend data point DTO
 */
export class TrendDataPointDto {
  @ApiProperty({ description: '日期（YYYY-MM-DD）' })
  date: string;

  @ApiProperty({ description: '新增物品数量' })
  newItems: number;

  @ApiProperty({ description: '累计物品数量' })
  totalItems: number;

  @ApiProperty({ description: '新增物品总价值' })
  newItemsValue: number;

  @ApiProperty({ description: '累计总价值' })
  totalValue: number;
}

/**
 * 趋势分析响应DTO - Trend analytics response DTO
 */
export class TrendAnalyticsDto {
  @ApiProperty({ description: '趋势数据点列表', type: [TrendDataPointDto] })
  dataPoints: TrendDataPointDto[];

  @ApiProperty({ description: '统计天数' })
  days: number;
}
