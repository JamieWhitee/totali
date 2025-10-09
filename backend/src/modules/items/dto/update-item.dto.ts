// src/modules/items/dto/update-item.dto.ts
import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsDate, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';

/**
 * 物品状态枚举 - Item status enum
 * 对应 Prisma schema 中的 ItemStatus
 */
export enum ItemStatus {
  ACTIVE = 'ACTIVE', // 服役中
  RETIRED = 'RETIRED', // 已退役
  SOLD = 'SOLD', // 已卖出
}

/**
 * 更新物品 DTO - Update item DTO
 * 继承 CreateItemDto 并将所有字段变为可选
 */
export class UpdateItemDto extends PartialType(CreateItemDto) {
  @ApiPropertyOptional({
    description: '物品状态 - Item status',
    enum: ItemStatus,
    example: ItemStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional({
    description: '卖出价格 - Sold price',
    example: 5000.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  soldPrice?: number;

  @ApiPropertyOptional({
    description: '卖出日期 - Sold date',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  soldDate?: Date;
}
