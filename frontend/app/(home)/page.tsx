import { PageLayout } from '@/components/layout/page-layout';
import { GridLayout } from '@/components/layout/grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function HomePage() {
  const items = [
    { id: 1, name: 'MacBook Pro', value: 15999, category: '电子产品', purchaseDate: '2024-01-15' },
    { id: 2, name: 'iPhone 15', value: 8999, category: '电子产品', purchaseDate: '2024-02-01' },
  ];

  if (items.length === 0) {
    return (
      <PageLayout title="我的物品" description="管理您的个人物品价值">
        <EmptyState
          title="暂无物品"
          description="开始添加您的第一个物品，追踪其价值变化"
          action={{
            label: '添加物品',
            onClick: () => console.log('添加物品'),
          }}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="我的物品"
      description="管理您的个人物品价值"
      actions={<Button>添加物品</Button>}
    >
      <GridLayout cols={3}>
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">¥{item.value}</p>
                <p className="text-sm text-muted-foreground">购买日期: {item.purchaseDate}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    编辑
                  </Button>
                  <Button size="sm">查看详情</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </GridLayout>
    </PageLayout>
  );
}
