import { apiClient } from './api-client';
import { type ApiResponse } from '@/types';
import { type SyncUserRequest, type UserSyncData } from '@/types/auth';

/**
 * 同步用户到后端数据库 - Sync user to backend database
 * 
 * 调用后端 POST /auth/sync-user 接口
 * 如果用户不存在则创建，如果已存在则返回现有用户信息
 * 
 * @param userData - 用户数据 - User data from Supabase
 * @returns 同步后的用户信息 - Synced user information
 */
export async function syncUserToBackend(
  userData: SyncUserRequest
): Promise<ApiResponse<UserSyncData>> {
  // 调用后端同步接口 - Call backend sync endpoint
  return apiClient.post<UserSyncData>('/auth/sync-user', userData);
}

/**
 * 测试JWT是否有效 - Test if JWT is valid
 * 
 * 调用后端 GET /auth/test 接口（需要认证）
 * 用于验证当前用户的JWT token是否有效
 * 
 * @returns 测试结果 - Test result
 */
export async function testJwtToken(): Promise<ApiResponse<{ message: string }>> {
  // 调用后端测试接口 - Call backend test endpoint
  return apiClient.get<{ message: string }>('/auth/test');
}