import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Totali App',
  description: 'Personal item value tracking system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
