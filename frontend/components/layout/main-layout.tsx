import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* 顶部导航栏 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">Totali</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="/" className="transition-colors hover:text-foreground/80">
                我的物品
              </a>
              <a href="/profile" className="transition-colors hover:text-foreground/80">
                个人资料
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  )
}