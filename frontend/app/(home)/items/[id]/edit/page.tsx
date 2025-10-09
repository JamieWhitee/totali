'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { itemsApi, type Category, type Item, type CreateItemDto } from '@/lib/api/items-api';
import { useToast } from '@/hooks/use-toast';

// 表单数据接口
interface EditFormData {
  name: string;
  categoryId: string;
  purchasePrice: string;
  purchaseDate: string;
  expectedLife: string;
  enableExpectedLife: boolean;
  notes: string;
  imageUrl: string;
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const itemId = params?.id as string;

  // 状态管理
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    categoryId: '',
    purchasePrice: '',
    purchaseDate: '',
    expectedLife: '',
    enableExpectedLife: false,
    notes: '',
    imageUrl: '',
  });

  // 计算日均成本
  const dailyCost = formData.purchasePrice
    ? (parseFloat(formData.purchasePrice) / 365).toFixed(2)
    : '0.00';

  // 检查登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // 获取分类列表和物品详情
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !itemId) return;

      try {
        setLoading(true);

        // 并行获取分类和物品详情
        const [categoriesRes, itemRes] = await Promise.all([
          itemsApi.getCategories(),
          itemsApi.getItem(itemId),
        ]);

        // 处理分类
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        // 处理物品详情
        if (itemRes.success && itemRes.data) {
          const itemData = itemRes.data as Item;
          setItem(itemData);

          // 填充表单
          setFormData({
            name: itemData.name,
            categoryId: itemData.categoryId,
            purchasePrice: itemData.purchasePrice.toString(),
            purchaseDate: itemData.purchaseDate.split('T')[0], // 只取日期部分
            expectedLife: itemData.expectedLife ? itemData.expectedLife.toString() : '',
            enableExpectedLife: !!itemData.expectedLife,
            notes: itemData.notes || '',
            imageUrl: itemData.imageUrl || '',
          });
        } else {
          toast({
            title: '获取失败',
            description: '无法获取物品信息',
            variant: 'destructive',
          });
          router.push('/');
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        toast({
          title: '加载失败',
          description: '无法加载数据，请重试',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (user && itemId) {
      fetchData();
    }
  }, [user, itemId, toast, router]);

  // 更新表单字段
  const updateField = (field: keyof EditFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 保存更新
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.name || !formData.categoryId || !formData.purchasePrice || !formData.purchaseDate) {
      toast({
        title: '验证失败',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: Partial<CreateItemDto> = {
        name: formData.name,
        categoryId: formData.categoryId,
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        notes: formData.notes || undefined,
        imageUrl: formData.imageUrl || undefined,
        expectedLife:
          formData.enableExpectedLife && formData.expectedLife
            ? parseInt(formData.expectedLife)
            : undefined,
      };

      const response = await itemsApi.updateItem(itemId, updateData);

      if (response.success) {
        toast({
          title: '更新成功',
          description: '物品信息已成功更新',
        });
        router.push(`/items/${itemId}`);
      } else {
        toast({
          title: '更新失败',
          description: response.error || '未知错误',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('更新物品失败:', error);
      toast({
        title: '更新失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
  if (!user || !item) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/items/${itemId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">编辑物品</h1>
            <p className="text-sm text-muted-foreground">修改物品信息</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-3xl space-y-6">
          {/* 基础信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">物品名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="如：iPhone 15 Pro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => updateField('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="可选，简单描述该物品"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 购买与保修 */}
          <Card>
            <CardHeader>
              <CardTitle>购买信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">购买价格 *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => updateField('purchasePrice', e.target.value)}
                    placeholder="¥"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">购买日期 *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => updateField('purchaseDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableExpectedLife"
                    checked={formData.enableExpectedLife}
                    onCheckedChange={(checked) => updateField('enableExpectedLife', checked as boolean)}
                  />
                  <Label htmlFor="enableExpectedLife" className="font-normal cursor-pointer">
                    启用预计使用时间
                  </Label>
                </div>
                {formData.enableExpectedLife && (
                  <Input
                    id="expectedLife"
                    type="number"
                    value={formData.expectedLife}
                    onChange={(e) => updateField('expectedLife', e.target.value)}
                    placeholder="预计使用天数"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyCost">日均成本（自动估算）</Label>
                <Input
                  id="dailyCost"
                  value={dailyCost ? `¥${dailyCost}/天` : ''}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* 图片链接 */}
          <Card>
            <CardHeader>
              <CardTitle>图片链接（可选）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="imageUrl">图片URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存修改'}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/items/${itemId}`)}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

