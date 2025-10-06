'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { type ApiError } from '@/types';

// 创建 QueryClient 实例
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据新鲜度：5分钟
        staleTime: 5 * 60 * 1000,
        // 缓存时间：10分钟
        gcTime: 10 * 60 * 1000,
        // 窗口聚焦时不自动重新获取
        refetchOnWindowFocus: false,
        // 重试策略
        retry: (failureCount, error: unknown) => {
          // 类型安全的错误检查
          const apiError = error as ApiError;
          // 认证错误不重试
          if (apiError?.status === 401 || apiError?.status === 403) {
            return false;
          }
          // 其他错误最多重试3次
          return failureCount < 3;
        },
        // 重试延迟：指数退避
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // 变更操作的重试策略
        retry: (failureCount, error: unknown) => {
          const apiError = error as ApiError;
          if (apiError?.status === 401 || apiError?.status === 403) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 开发环境下显示 React Query DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}