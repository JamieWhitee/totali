import { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function PageLayout({ title, description, children, actions }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="mt-2 text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <Separator className="mb-6" />
        {children}
      </div>
    </div>
  );
}
