/**
 * 认证 Hook - Authentication Hook
 * 管理 Supabase 认证状态 - Manages Supabase authentication state
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  type User, 
  type Session,
  type AuthChangeEvent 
} from '@supabase/supabase-js';
import { 
  type Profile, 
  type AuthError, 
  type AuthStatus,
  type SyncUserRequest,
  isSupabaseError 
} from '@/types/auth';
// 在现有导入下面添加 - Add below existing imports
import { syncUserToBackend } from '@/lib/api/auth-api';
interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  status: AuthStatus;
  error: AuthError | null;
}

// ✅ 错误转换辅助函数
function transformSupabaseError(error: unknown): AuthError {
  if (isSupabaseError(error)) {
    return {
      message: error.message,
      status: 400,
      code: 'code' in error ? String(error.code) : undefined,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }
  
  return {
    message: 'An unknown error occurred',
    status: 500,
  };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    status: 'loading',
    error: null,
  });

  // ✅ 安全的状态更新函数
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 同步用户到后端数据库 - Sync user to backend database
   * 
   * 从Supabase用户对象提取数据并同步到本地数据库
   * 即使同步失败也不会影响前端登录流程
   */
  const syncUser = useCallback(async (user: User) => {
    try {
      // 检查必需字段 - Check required fields
      if (!user.email) {
        console.warn('⚠️ 用户缺少邮箱信息，跳过同步 - User missing email, skipping sync');
        return null;
      }

      // 构造同步请求数据 - Build sync request data
      const syncData: SyncUserRequest = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        avatarUrl: user.user_metadata?.avatar_url,
      };

      // 调用后端同步接口 - Call backend sync endpoint
      const response = await syncUserToBackend(syncData);

      // 打印同步结果（开发环境） - Log sync result (development)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('✅ 用户同步成功 - User synced successfully:', response.data);
      }

      return response;
    } catch (error) {
      // 同步失败不应阻塞登录流程，仅记录错误 - Sync failure should not block login, just log error
      // eslint-disable-next-line no-console
      console.error('❌ 用户同步失败 - User sync failed:', error);
      // 不抛出错误，让登录流程继续 - Don't throw error, let login continue
      return null;
    }
  }, []);

  // 初始化认证状态 - Initialize authentication state
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          updateAuthState({
            status: 'error',
            error: transformSupabaseError(error),
          });
        } else {
          updateAuthState({
            session,
            user: session?.user ?? null,
            status: session?.user ? 'authenticated' : 'unauthenticated',
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          updateAuthState({
            status: 'error',
            error: transformSupabaseError(error),
          });
        }
      }
    }

    getInitialSession();

    // ✅ 类型安全的认证状态监听
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        updateAuthState({
          session,
          user: session?.user ?? null,
          status: session?.user ? 'authenticated' : 'unauthenticated',
          error: null,
        });

        // 处理特定认证事件
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // 可以在这里获取用户资料等额外信息
          // Can fetch additional user profile information here
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [updateAuthState]);

  // ✅ 类型安全的登录方法
  const signIn = useCallback(async (email: string, password: string) => {
    updateAuthState({ status: 'loading', error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const authError = transformSupabaseError(error);
        updateAuthState({
          status: 'error',
          error: authError,
        });
        throw authError;
      }

      updateAuthState({
        session: data.session,
        user: data.user,
        status: 'authenticated',
        error: null,
      });

      // 🔄 登录成功后同步用户到后端 - Sync user to backend after successful login
      if (data.user) {
        await syncUser(data.user);
      }

      return data;
    } catch (error) {
      const authError = transformSupabaseError(error);
      updateAuthState({
        status: 'error',
        error: authError,
      });
      throw authError;
    }
  }, [updateAuthState, syncUser]);

  // ✅ 类型安全的注册方法
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    name?: string
  ): Promise<{ user: User | null; session: Session | null }> => {
    updateAuthState({ status: 'loading', error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        const authError = transformSupabaseError(error);
        updateAuthState({
          status: 'error',
          error: authError,
        });
        throw authError;
      }

      updateAuthState({ 
        status: 'unauthenticated', // 注册后通常需要邮箱验证
        error: null 
      });

      // 🔄 注册成功后同步用户到后端 - Sync user to backend after successful signup
      if (data.user) {
        await syncUser(data.user);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      const authError = transformSupabaseError(error);
      updateAuthState({
        status: 'error',
        error: authError,
      });
      throw authError;
    }
  }, [updateAuthState, syncUser]);

  // ✅ 类型安全的登出方法
  const signOut = useCallback(async (): Promise<void> => {
    updateAuthState({ status: 'loading', error: null });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        const authError = transformSupabaseError(error);
        updateAuthState({
          status: 'error',
          error: authError,
        });
        throw authError;
      }

      setState({
        user: null,
        profile: null,
        session: null,
        status: 'unauthenticated',
        error: null,
      });
    } catch (error) {
      const authError = transformSupabaseError(error);
      updateAuthState({
        status: 'error',
        error: authError,
      });
      throw authError;
    }
  }, [updateAuthState]);

  // ✅ 类型安全的密码重置方法
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    updateAuthState({ status: 'loading', error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      updateAuthState({ status: state.user ? 'authenticated' : 'unauthenticated' });

      if (error) {
        throw transformSupabaseError(error);
      }
    } catch (error) {
      const authError = transformSupabaseError(error);
      updateAuthState({
        status: 'error',
        error: authError,
      });
      throw authError;
    }
  }, [updateAuthState, state.user]);

  // ✅ 类型安全的密码更新方法
  const updatePassword = useCallback(async (newPassword: string): Promise<void> => {
    updateAuthState({ status: 'loading', error: null });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      updateAuthState({ status: 'authenticated' });

      if (error) {
        throw transformSupabaseError(error);
      }
    } catch (error) {
      const authError = transformSupabaseError(error);
      updateAuthState({
        status: 'error',
        error: authError,
      });
      throw authError;
    }
  }, [updateAuthState]);

  return {
    // 状态 - State
    user: state.user,
    profile: state.profile,
    session: state.session,
    status: state.status,
    loading: state.status === 'loading',
    error: state.error,
    
    // 计算属性 - Computed properties
    isAuthenticated: state.status === 'authenticated',
    isEmailConfirmed: state.user?.email_confirmed_at != null,
    
    // 方法 - Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  } as const; // ✅ 使用 as const 确保返回类型不变
}

// ✅ 导出Hook的返回类型
export type UseAuthReturn = ReturnType<typeof useAuth>;