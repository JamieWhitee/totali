// src/modules/items/dto/create-category.dto.ts
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建分类 DTO - Create category DTO
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: '分类名称 - Category name',
    example: '数码产品',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: '图标名称 - Icon name',
    example: 'laptop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
