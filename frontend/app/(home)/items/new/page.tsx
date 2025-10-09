'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { itemsApi, type Category } from '@/lib/api/items-api';
import { useToast } from '@/hooks/use-toast';

// 物品图标列表 - Item icons
const ITEM_ICONS = [
  '📱', '💻', '🖥️', '⌚', '🎧', '🔌',
  '📺', '🎮', '📷', '🎒', '🧳', '👟',
  '👗', '📚', '🪑', '🛏️', '🍳', '🔧',
  '🪚', '🧰'
];

// 表单数据接口 - Form data interface
interface FormData {
  name: string;
  categoryId: string;
  purchasePrice: string;
  purchaseDate: string;
  expectedLife: string;
  enableExpectedLife: boolean;
  notes: string;
  imageUrl: string;
  icon: string;
  status: string;
}

export default function NewItemPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // 表单数据 - Form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    categoryId: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expectedLife: '',
    enableExpectedLife: false,
    notes: '',
    imageUrl: '',
    icon: '📱',
    status: 'ACTIVE',
  });

  // 计算的日均成本 - Calculated daily cost
  const dailyCost = formData.purchasePrice
    ? (parseFloat(formData.purchasePrice) / 365).toFixed(2)
    : '0.00';

  // 检查登录状态
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await itemsApi.getCategories();
        
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          toast({
            title: '获取分类失败',
            description: response.error || '未知错误',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('获取分类失败:', error);
        toast({
          title: '获取分类失败',
          description: error instanceof Error ? error.message : '请检查网络连接或重新登录',
          variant: 'destructive',
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    if (user) {
      fetchCategories();
    }
  }, [user, toast]);

  // 更新表单字段
  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 保存物品
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
      const requestBody = {
        name: formData.name,
        categoryId: formData.categoryId,
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        notes: formData.notes || undefined,
        imageUrl: formData.imageUrl || undefined,
        expectedLife: formData.enableExpectedLife && formData.expectedLife
          ? parseInt(formData.expectedLife)
          : undefined,
      };

      const response = await itemsApi.createItem(requestBody);

      if (response.success) {
        toast({
          title: '创建成功',
          description: '物品已成功添加',
        });
        router.push('/');
      } else {
        toast({
          title: '创建失败',
          description: response.error || '未知错误',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('创建物品失败:', error);
      toast({
        title: '创建失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 加载中状态
  if (loading) {
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
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">添加物品</h1>
            <p className="text-sm text-muted-foreground">记录您的个人物品信息</p>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基础信息 - Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>基础信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">物品名称 *</Label>
                  <Input
                    id="name"
                    placeholder="如：iPhone 15 Pro"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">分类 *</Label>
                  {loadingCategories ? (
                    <div className="text-sm text-muted-foreground">加载分类中...</div>
                  ) : (
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
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">备注</Label>
                  <Textarea
                    id="notes"
                    placeholder="可选，简单描述该物品"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 购买与保修 - Purchase and Warranty */}
            <Card>
              <CardHeader>
                <CardTitle>购买与保修</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">购买价格 *</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      placeholder="¥"
                      value={formData.purchasePrice}
                      onChange={(e) => updateField('purchasePrice', e.target.value)}
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
                      placeholder="预计使用天数"
                      value={formData.expectedLife}
                      onChange={(e) => updateField('expectedLife', e.target.value)}
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

            {/* 图标选择 - Icon Selection */}
            <Card>
              <CardHeader>
                <CardTitle>图标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border text-2xl">
                    {formData.icon}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                  >
                    {showIconPicker ? '收起图标' : '选择图标'}
                  </Button>
                </div>

                {showIconPicker && (
                  <div className="mt-4 grid grid-cols-10 gap-2">
                    {ITEM_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          updateField('icon', icon);
                          setShowIconPicker(false);
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors hover:bg-accent ${
                          formData.icon === icon ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 图片链接（可选） - Image URL (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle>图片链接（可选）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="imageUrl">图片URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                />
              </CardContent>
            </Card>

            {/* 操作按钮 - Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存物品'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                取消
              </Button>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>摘要预览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">物品名称</span>
                  <span className="font-medium">{formData.name || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">分类</span>
                  <span className="font-medium">
                    {categories.find((c) => c.id === formData.categoryId)?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">购买价格</span>
                  <span className="font-medium">
                    {formData.purchasePrice ? `¥${formData.purchasePrice}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">估计日均成本</span>
                  <span className="font-medium">{dailyCost ? `¥${dailyCost}/天` : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">图标</span>
                  <span className="text-xl">{formData.icon}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
