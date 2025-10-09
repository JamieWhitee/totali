'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Plus, FileText, BarChart3, Settings, LogOut, Package } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { itemsApi, type ItemWithStats, type UserItemsOverview } from '@/lib/api/items-api';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 状态管理 - State management
  const [items, setItems] = useState<ItemWithStats[]>([]);
  const [overview, setOverview] = useState<UserItemsOverview | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // 检查登录状态，未登录则跳转到登录页
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoadingData(true);
        
        // 并行获取物品列表和统计数据
        const [itemsResponse, overviewResponse] = await Promise.all([
          itemsApi.getItems({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
          itemsApi.getItemsOverview(),
        ]);

        if (itemsResponse.success && itemsResponse.data) {
          setItems(itemsResponse.data.items);
        }

        if (overviewResponse.success && overviewResponse.data) {
          setOverview(overviewResponse.data);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        toast({
          title: '加载失败',
          description: '无法加载数据，请刷新页面重试',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 跳转到物品详情页
  const handleItemClick = (itemId: string) => {
    router.push(`/items/${itemId}`);
  };

  // 加载中显示骨架屏
  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录不渲染内容（正在跳转）
  if (!user) {
    return null;
  }

  // 统计卡片数据
  const stats = [
    {
      label: '资产总值',
      value: overview ? `¥${overview.totalValue.toFixed(0)}` : '¥0',
      description: '所有物品购买价值总和',
    },
    {
      label: '物品数量',
      value: overview ? overview.totalItems.toString() : '0',
      description: `服役中 ${overview?.activeItems || 0} 件`,
    },
    {
      label: '平均日均成本',
      value: overview ? `¥${overview.averageDailyCost.toFixed(2)}` : '¥0.00',
      description: '所有物品平均每天成本',
    },
    {
      label: '已退役/已卖出',
      value: overview ? `${overview.retiredItems + overview.soldItems}` : '0',
      description: `退役 ${overview?.retiredItems || 0} / 卖出 ${overview?.soldItems || 0}`,
    },
  ];

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: { label: '服役中', variant: 'default' as const },
      IDLE: { label: '闲置', variant: 'secondary' as const },
      EXPIRED: { label: '已过期', variant: 'destructive' as const },
      SOLD: { label: '已卖出', variant: 'outline' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-muted/50">
        <div className="container flex items-center justify-between px-4 py-8">
          <div>
            <h1 className="text-2xl font-semibold">
              欢迎回来，{user?.user_metadata?.name || '用户'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">今天是个管理物品的好日子 ✨</p>
              </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              登出
                  </Button>
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-2xl">
                {user?.email?.charAt(0).toUpperCase() || '👤'}
              </AvatarFallback>
            </Avatar>
          </div>
                </div>
              </div>

      {/* Main Content */}
      <div className="container px-4 py-6">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button className="gap-2" onClick={() => router.push('/items/new')}>
            <Plus className="h-4 w-4" />
            添加物品
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            使用记录
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => router.push('/analytics')}>
            <BarChart3 className="h-4 w-4" />
            数据分析
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            设置
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
        </div>

        {/* Items Section Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">我的物品</h2>
          <p className="text-sm text-muted-foreground">
            {items.length > 0 ? `共 ${overview?.totalItems || 0} 件物品` : '还没有添加任何物品'}
          </p>
        </div>
        <Separator className="mb-6" />

        {/* 空状态提示 - Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">还没有物品</h3>
            <p className="text-sm text-muted-foreground mb-6">开始添加您的第一件物品吧！</p>
            <Button onClick={() => router.push('/items/new')}>
              <Plus className="mr-2 h-4 w-4" />
              添加第一件物品
            </Button>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const statusInfo = getStatusBadge(item.status);
                const categoryIcon = item.category?.icon || '📦';

                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted text-2xl">
                          {categoryIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{item.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {item.category?.name || '未分类'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold">¥{item.dailyCost.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">元/天</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">¥{item.purchasePrice}</div>
                          <div className="text-xs text-muted-foreground">购买价</div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">已使用 {item.daysUsed} 天</div>
                        {item.usageEfficiency !== null && (
                          <div className="text-muted-foreground">
                            效率: {(item.usageEfficiency * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center pt-2">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Load More (如果有更多物品) */}
            {overview && overview.totalItems > items.length && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => router.push('/items')}>
                  查看所有物品 (显示 {items.length}/{overview.totalItems})
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
