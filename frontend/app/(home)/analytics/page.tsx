'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  itemsApi,
  type UserItemsOverview,
  type EfficiencyAnalytics,
  type EfficiencyItem,
  type CategoryEfficiencyComparison,
  type CategoryEfficiency,
  type TrendAnalytics,
} from '@/lib/api/items-api';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // 状态管理
  const [overview, setOverview] = useState<UserItemsOverview | null>(null);
  const [analytics, setAnalytics] = useState<EfficiencyAnalytics | null>(null);
  const [categoryComparison, setCategoryComparison] = useState<CategoryEfficiencyComparison | null>(null);
  const [trendAnalytics, setTrendAnalytics] = useState<TrendAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('0'); // 默认显示全部

  // 时间范围选项
  const timeRanges = [
    { value: '0', label: '全部' },
    { value: '3', label: '3天' },
    { value: '7', label: '7天' },
    { value: '30', label: '30天' },
    { value: '90', label: '90天' },
    { value: '180', label: '180天' },
    { value: '365', label: '365天' },
  ];

  // 检查登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // 获取分析数据
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const days = parseInt(selectedTimeRange);

        // 并行获取概览、效率分析、分类对比和趋势数据
        const [overviewRes, analyticsRes, categoryRes, trendRes] = await Promise.all([
          itemsApi.getItemsOverview(),
          itemsApi.getEfficiencyAnalytics(5, days > 0 ? days : undefined),
          itemsApi.getCategoryEfficiencyComparison(),
          itemsApi.getTrendAnalytics(30), // 默认30天趋势
        ]);

        if (overviewRes.success && overviewRes.data) {
          setOverview(overviewRes.data);
        }

        if (analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }

        if (categoryRes.success && categoryRes.data) {
          setCategoryComparison(categoryRes.data);
        }

        if (trendRes.success && trendRes.data) {
          setTrendAnalytics(trendRes.data);
        }
      } catch (error) {
        console.error('获取分析数据失败:', error);
        toast({
          title: '加载失败',
          description: '无法加载分析数据，请重试',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user, selectedTimeRange, toast]); // 添加 selectedTimeRange 依赖

  // 获取效率等级
  const getEfficiencyLevel = (efficiency: number) => {
    if (efficiency >= 0.7) return { label: '高效', variant: 'default' as const };
    if (efficiency >= 0.4) return { label: '中等', variant: 'secondary' as const };
    return { label: '低效', variant: 'destructive' as const };
  };

  // 加载中
  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <span>📊</span>
                数据分析
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Analyze your item usage efficiency
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* 时间选择器 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📅</span>
                时间维度分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {timeRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={selectedTimeRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                选择时间范围以查看对应时期购买的物品效率分析
              </p>
            </CardContent>
          </Card>

          {/* 全局统计 */}
          {overview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📈</span>
                  全局统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">¥{overview.averageDailyCost.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">平均日均使用成本</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">
                      {analytics?.overallUsageRate ? `${analytics.overallUsageRate.toFixed(0)}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">整体使用率</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">{overview.totalItems}</div>
                    <div className="text-sm text-muted-foreground">总物品数量</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">¥{overview.totalValue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">物品总价值</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 最高效物品 Top 5 */}
          {analytics && analytics.topEfficient.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏆</span>
                  最高效物品 Top 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topEfficient.map((item: EfficiencyItem) => {
                    const level = getEfficiencyLevel(item.usageEfficiency);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => router.push(`/items/${item.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-2xl">
                            {item.categoryIcon}
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              使用率: {(item.usageEfficiency * 100).toFixed(0)}% | 日均成本: ¥
                              {item.dailyCost.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <Badge variant={level.variant}>{(item.usageEfficiency * 100).toFixed(0)}%</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 最低效物品 Top 5 */}
          {analytics && analytics.leastEfficient.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>⚠️</span>
                  最低效物品 Top 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.leastEfficient.map((item: EfficiencyItem) => {
                    const level = getEfficiencyLevel(item.usageEfficiency);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => router.push(`/items/${item.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-2xl">
                            {item.categoryIcon}
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              使用率: {(item.usageEfficiency * 100).toFixed(0)}% | 日均成本: ¥
                              {item.dailyCost.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <Badge variant={level.variant}>{(item.usageEfficiency * 100).toFixed(0)}%</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 趋势图表 */}
          {trendAnalytics && trendAnalytics.dataPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📈</span>
                  物品增长趋势（最近30天）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendAnalytics.dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(value) => `日期: ${value}`}
                      formatter={(value: number, name: string) => {
                        const nameMap: { [key: string]: string } = {
                          newItems: '新增物品',
                          totalItems: '累计物品',
                          newItemsValue: '新增价值',
                          totalValue: '累计价值',
                        };
                        return [
                          name.includes('Value') ? `¥${value.toFixed(2)}` : value,
                          nameMap[name] || name,
                        ];
                      }}
                    />
                    <Legend
                      formatter={(value: string) => {
                        const nameMap: { [key: string]: string } = {
                          newItems: '新增物品',
                          totalItems: '累计物品',
                          newItemsValue: '新增价值',
                          totalValue: '累计价值',
                        };
                        return nameMap[value] || value;
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="newItems"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalItems"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  趋势图展示最近30天的物品新增和累计数量变化
                </p>
              </CardContent>
            </Card>
          )}

          {/* 分类效率对比 */}
          {categoryComparison && categoryComparison.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📊</span>
                  分类效率对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryComparison.categories.map((category: CategoryEfficiency) => {
                    const efficiencyPercent = (category.averageEfficiency * 100).toFixed(0);
                    const level = getEfficiencyLevel(category.averageEfficiency);
                    return (
                      <div
                        key={category.categoryId}
                        className="flex items-center justify-between rounded-lg border bg-muted/50 p-4"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background text-2xl">
                            {category.categoryIcon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-lg">{category.categoryName}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {category.itemCount} 件物品 | 总价值 ¥{category.totalValue.toLocaleString()} | 平均日均成本 ¥
                              {category.averageDailyCost.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{efficiencyPercent}%</div>
                            <div className="text-xs text-muted-foreground">平均效率</div>
                          </div>
                          <Badge variant={level.variant}>{level.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 空状态 */}
          {analytics && analytics.topEfficient.length === 0 && analytics.leastEfficient.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">暂无分析数据，请先添加物品</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

