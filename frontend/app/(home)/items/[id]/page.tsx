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

  // State management
  const [item, setItem] = useState<ItemWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const itemId = params?.id as string;

  // Check login status
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      if (!user || !itemId) return;

      try {
        setLoading(true);
        const response = await itemsApi.getItem(itemId);

        if (response.success && response.data) {
          // Calculate statistics
          const itemData = response.data as ItemWithStats;
          setItem(itemData);
        } else {
          toast({
            title: 'Failed to Load',
            description: response.error || 'Unable to load item information',
            variant: 'destructive',
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch item details:', error);
        toast({
          title: 'Loading Failed',
          description: 'Unable to load item information, please try again',
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

  // Delete item
  const handleDelete = async () => {
    if (!item) return;

    try {
      setDeleting(true);
      const response = await itemsApi.deleteItem(item.id);

      if (response.success) {
        toast({
          title: 'Deleted Successfully',
          description: 'Item has been deleted',
        });
        router.push('/');
      } else {
        toast({
          title: 'Delete Failed',
          description: response.error || 'Unable to delete item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast({
        title: 'Delete Failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Edit item
  const handleEdit = () => {
    router.push(`/items/${itemId}/edit`);
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusMap = {
      ACTIVE: { label: 'Active', variant: 'default' as const },
      IDLE: { label: 'Idle', variant: 'secondary' as const },
      EXPIRED: { label: 'Expired', variant: 'destructive' as const },
      SOLD: { label: 'Sold', variant: 'outline' as const },
      RETIRED: { label: 'Retired', variant: 'outline' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE;
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return null;
  }

  // Item not found
  if (!item) {
    return null;
  }

  const statusInfo = getStatusInfo(item.status);
  const itemIcon = item.icon || '📦';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-background text-3xl">
                {itemIcon}
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
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="text-base font-medium">{item.category?.name || 'Uncategorized'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Purchase Price</div>
                  <div className="text-base font-medium text-primary">¥{item.purchasePrice}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Purchase Date</div>
                  <div className="text-base font-medium">
                    {new Date(item.purchaseDate).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Days Owned</div>
                  <div className="text-base font-medium">{item.daysUsed} days</div>
                </div>
                {item.expectedLife && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Expected Lifespan</div>
                    <div className="text-base font-medium">{item.expectedLife} days</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Actual Daily Cost</div>
                  <div className="text-2xl font-bold">¥{item.dailyCost.toFixed(2)}</div>
                </div>
              </div>

              {item.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Notes</div>
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
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="text-2xl font-bold">{item.daysUsed}</div>
                  <div className="text-sm text-muted-foreground">Days Used</div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="text-2xl font-bold">¥{item.dailyCost.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Actual Daily Cost</div>
                </div>
                {item.usageEfficiency !== null && (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">
                      {(item.usageEfficiency * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Usage Efficiency</div>
                  </div>
                )}
              </div>

              {item.usageEfficiency !== null && (
                <div className="mt-4 flex justify-center">
                  <Badge
                    variant={item.usageEfficiency >= 0.7 ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    {item.usageEfficiency >= 0.7 ? '✅ High Efficiency' : '⚠️ Medium Efficiency'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 - Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 - Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{item.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
