'use client';

import { QueryProvider } from '@/lib/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
