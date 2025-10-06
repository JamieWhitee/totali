import { type AuthError as SupabaseAuthError } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isActive: boolean;
  preferences?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ✅ 更严格的错误类型定义
export interface AuthError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

// ✅ 认证事件类型
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

// ✅ 认证状态类型
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Supabase Auth User 类型导出
export type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * 类型守卫：检查是否为 Supabase 错误 - Type guard: Check if error is Supabase error
 */
export function isSupabaseError(error: unknown): error is SupabaseAuthError {
  if (typeof error !== 'object' || error === null) return false;
  if (!('message' in error)) return false;
  if (typeof (error as Record<string, unknown>).message !== 'string') return false;
  
  return true;
}

/**
 * 用户同步请求数据 - User sync request data
 * 对应后端 SyncUserDto
 */
export interface SyncUserRequest {
  id: string;              // Supabase用户ID - Supabase user ID
  email: string;           // 用户邮箱 - User email
  name?: string;           // 用户名称（可选） - User name (optional)
  avatarUrl?: string;      // 头像URL（可选） - Avatar URL (optional)
}

/**
 * 用户同步响应数据 - User sync response data
 * 对应后端 UserSyncData
 */
export interface UserSyncData {
  id: string;              // 用户ID - User ID
  email: string;           // 用户邮箱 - User email
  name: string | null;     // 用户名称 - User name
  avatarUrl: string | null; // 头像URL - Avatar URL
  createdAt: string;       // 创建时间 - Created timestamp
  updatedAt: string;       // 更新时间 - Updated timestamp
}