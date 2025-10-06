/**
 * 认证提供者 - Authentication provider
 * 提供全局认证状态管理 - Provides global authentication state management
 */
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { type User, type Session } from '@supabase/supabase-js';
import { type Profile, type AuthError } from '@/types/auth';

interface AuthContextType {
  // 状态 - State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  
  // 计算属性 - Computed properties
  isAuthenticated: boolean;
  isEmailConfirmed: boolean;
  
  // 方法 - Methods
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// 导出别名便于使用 - Export alias for convenience
export { useAuthContext as useAuth };
