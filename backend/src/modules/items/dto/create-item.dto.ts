// src/modules/items/dto/create-item.dto.ts
import { IsString, IsNumber, IsDate, IsOptional, IsUrl, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 创建物品 DTO - Create item DTO
 */
export class CreateItemDto {
  @ApiProperty({
    description: '物品名称 - Item name',
    example: 'iPhone 15 Pro',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: '分类ID - Category ID',
    example: 'sys-电子产品',
  })
  @IsString()
  @MinLength(1)
  categoryId: string;

  @ApiProperty({
    description: '购买价格 - Purchase price',
    example: 9999.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchasePrice: number;

  @ApiProperty({
    description: '购买日期 - Purchase date',
    example: '2024-01-15',
  })
  @IsDate()
  @Type(() => Date) // 转换字符串为 Date 对象
  purchaseDate: Date;

  @ApiPropertyOptional({
    description: '预计使用天数 - Expected life in days',
    example: 1095, // 3年
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expectedLife?: number;

  @ApiPropertyOptional({
    description: '备注 - Notes',
    example: '256GB 深空黑',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: '图片URL - Image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: '物品图标 - Item icon',
    example: '📱',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;
}
