// src/common/dto/api-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一API响应格式 - Unified API response format
 */
export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Success status - 成功状态', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response data - 响应数据', required: false })
  data?: T;

  @ApiProperty({ description: 'Response message - 响应消息', required: false })
  message?: string;

  @ApiProperty({ description: 'Error message - 错误信息', required: false })
  error?: string;
}

/**
 * 创建成功响应 - Create success response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponseDto<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * 创建错误响应 - Create error response
 */
export function createErrorResponse(error: string, message?: string): ApiResponseDto<null> {
  return {
    success: false,
    error,
    message,
  };
}
