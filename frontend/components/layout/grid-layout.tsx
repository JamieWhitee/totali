import { ReactNode } from 'react';

interface GridLayoutProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GridLayout({ children, cols = 3, gap = 'md', className = '' }: GridLayoutProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gridGap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return <div className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`}>{children}</div>;
}
