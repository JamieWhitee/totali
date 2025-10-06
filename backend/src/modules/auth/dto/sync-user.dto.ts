// src/modules/auth/dto/sync-user.dto.ts
import { IsString, IsEmail, IsOptional, IsUUID, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncUserDto {
  @ApiProperty({ description: 'Supabase user ID' })
  @IsUUID('4')
  id: string;

  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'User name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;
}

export class UserSyncData {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Name', required: false })
  name: string | null;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatarUrl: string | null;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;
}
