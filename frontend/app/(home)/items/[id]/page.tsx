/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ItemDetailPageProps {
  params: {
    id: string
  }
}

// 模拟数据
const mockItem = {
  id: '1',
  name: 'MacBook Pro',
  category: '电子产品',
  value: 15999,
  purchaseDate: '2024-01-15',
  description: 'Apple MacBook Pro 14英寸，M3芯片，16GB内存，512GB存储',
  tags: ['电脑', '苹果', '工作'],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  const item = mockItem

  if (!item) {
    notFound()
  }

  return (
    <PageLayout
      title={item.name}
      description={`购买日期: ${item.purchaseDate}`}
      actions={
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </Link>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            编辑物品
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">分类</label>
                  <div className="mt-1">
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">购买价值</label>
                  <p className="text-2xl font-bold text-primary mt-1">¥{item.value.toLocaleString()}</p>
                </div>
              </div>
              
              <Separator />
              
              {item.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">描述</label>
                  <p className="mt-1 text-sm">{item.description}</p>
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">标签</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏操作 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                编辑物品
              </Button>
              <Button className="w-full" variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                删除物品
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>统计信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">创建时间</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">更新时间</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}