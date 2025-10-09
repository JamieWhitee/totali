'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { itemsApi, type ItemWithStats } from '@/lib/api/items-api';
import { useToast } from '@/hooks/use-toast';

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // 状态管理
  const [item, setItem] = useState<ItemWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const itemId = params?.id as string;

  // 检查登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // 获取物品详情
  useEffect(() => {
    const fetchItem = async () => {
      if (!user || !itemId) return;

      try {
        setLoading(true);
        const response = await itemsApi.getItem(itemId);

        if (response.success && response.data) {
          // 需要计算统计数据
          const itemData = response.data as ItemWithStats;
          setItem(itemData);
        } else {
          toast({
            title: '获取失败',
            description: response.error || '无法获取物品信息',
            variant: 'destructive',
          });
          router.push('/');
        }
      } catch (error) {
        console.error('获取物品详情失败:', error);
        toast({
          title: '加载失败',
          description: '无法加载物品信息，请重试',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (user && itemId) {
      fetchItem();
    }
  }, [user, itemId, toast, router]);

  // 删除物品
  const handleDelete = async () => {
    if (!item) return;

    try {
      setDeleting(true);
      const response = await itemsApi.deleteItem(item.id);

      if (response.success) {
        toast({
          title: '删除成功',
          description: '物品已成功删除',
        });
        router.push('/');
      } else {
        toast({
          title: '删除失败',
          description: response.error || '无法删除物品',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('删除物品失败:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // 编辑物品
  const handleEdit = () => {
    router.push(`/items/${itemId}/edit`);
  };

  // 获取状态信息
  const getStatusInfo = (status: string) => {
    const statusMap = {
      ACTIVE: { label: '服役中', variant: 'default' as const },
      IDLE: { label: '闲置', variant: 'secondary' as const },
      EXPIRED: { label: '已过期', variant: 'destructive' as const },
      SOLD: { label: '已卖出', variant: 'outline' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE;
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

  // 物品不存在
  if (!item) {
    return null;
  }

  const statusInfo = getStatusInfo(item.status);
  const categoryIcon = item.category?.icon || '📦';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-background text-3xl">
                {categoryIcon}
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{item.name}</h1>
                <Badge variant={statusInfo.variant} className="mt-2">
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* 基础信息 - Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>ℹ️</span>
                基础信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">分类</div>
                  <div className="text-base font-medium">{item.category?.name || '未分类'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">购买价格</div>
                  <div className="text-base font-medium text-primary">¥{item.purchasePrice}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">购买日期</div>
                  <div className="text-base font-medium">
                    {new Date(item.purchaseDate).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">已拥有天数</div>
                  <div className="text-base font-medium">{item.daysUsed} 天</div>
                </div>
                {item.expectedLife && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">预计使用寿命</div>
                    <div className="text-base font-medium">{item.expectedLife} 天</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">日均成本（理论）</div>
                  <div className="text-base font-medium">¥{item.dailyCost.toFixed(2)}/天</div>
                </div>
              </div>

              {item.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">备注</div>
                    <div className="text-base">{item.notes}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 使用统计 - Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span>
                使用统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="text-2xl font-bold">{item.daysUsed}</div>
                  <div className="text-sm text-muted-foreground">使用天数</div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="text-2xl font-bold">¥{item.dailyCost.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">实际日均成本</div>
                </div>
                {item.usageEfficiency !== null && (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">
                      {(item.usageEfficiency * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">使用效率</div>
                  </div>
                )}
              </div>

              {item.usageEfficiency !== null && (
                <div className="mt-4 flex justify-center">
                  <Badge
                    variant={item.usageEfficiency >= 0.7 ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    {item.usageEfficiency >= 0.7 ? '✅ 高效率' : '⚠️ 中效率'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 - Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 - Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除「{item.name}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
