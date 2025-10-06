// src/modules/auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SyncUserDto, UserSyncData } from './dto/sync-user.dto';
import { ApiResponseDto, createSuccessResponse } from '../../common/api-response.dto';

/**
 * 认证控制器 - Authentication controller
 * 处理用户认证相关的API接口 - Handles user authentication related API endpoints
 */
@ApiTags('Authentication - 用户认证')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * 同步用户到本地数据库 - Sync user to local database
   * 前端Supabase注册成功后调用此接口 - Frontend calls this after successful Supabase registration
   * 如果用户不存在则创建，存在则返回现有信息 - Create if user doesn't exist, return existing info if exists
   */
  @Post('sync-user')
  @ApiOperation({
    summary: '同步用户到本地 - Sync user to local database',
    description: '将Supabase认证的用户信息同步到本地PostgreSQL数据库 - Sync Supabase authenticated user to local PostgreSQL database',
  })
  @ApiResponse({
    status: 201,
    description: '用户同步成功 - User sync successful',
    type: ApiResponseDto<UserSyncData>,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误 - Invalid request parameters',
  })
  async syncUser(@Body() syncUserDto: SyncUserDto): Promise<ApiResponseDto<UserSyncData>> {
    this.logger.log(`Syncing user to local database: ${syncUserDto.email}`);

    // 调用服务层同步用户到本地数据库 - Call service layer to sync user to local database
    const result = await this.authService.syncUserToLocal(syncUserDto);
    return result;
  }

  /**
   * 测试JWT验证 - Test JWT validation
   * 仅验证token是否有效 - Only validates if token is valid
   */
  @Get('test')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '测试JWT - Test JWT',
    description: '测试Bearer token是否有效',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT有效',
  })
  @ApiResponse({
    status: 401,
    description: 'JWT无效',
  })
  testJwt(): ApiResponseDto<{ message: string }> {
    // 如果能执行到这里，说明JWT验证成功 - If we reach here, JWT validation succeeded
    return createSuccessResponse({ message: 'JWT is valid' }, 'JWT validation successful');
  }
  //eyJhbGciOiJIUzI1NiIsImtpZCI6IjdicUg0U3AwNUh1RDV5aloiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NxbmNteWhyemlneWVidnZhcmJmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2N2I1NTUwMS02MzZlLTQ3ZjUtOWE5Ni0wODQzODNhOTlkYjYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4OTgyOTcwLCJpYXQiOjE3NTg5NzkzNzAsImVtYWlsIjoiaWJiQHRlc3QuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImliYkB0ZXN0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiaWJiIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI2N2I1NTUwMS02MzZlLTQ3ZjUtOWE5Ni0wODQzODNhOTlkYjYifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc1ODk3OTM3MH1dLCJzZXNzaW9uX2lkIjoiYzA5NmJlYjktZjcyMS00Zjc3LWE4OWUtMGUyZDg3NGZhYjZhIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.7HPXtp6252GyiSmT_mSeFmV9Io8CUPlrN_kywEhqz3c
}
