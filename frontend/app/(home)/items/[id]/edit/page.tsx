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

// Item icons list
const ITEM_ICONS = [
  '📱', '💻', '🖥️', '⌚', '🎧', '🔌',
  '📺', '🎮', '📷', '🎒', '🧳', '👟',
  '👗', '📚', '🪑', '🛏️', '🍳', '🔧',
  '🪚', '🧰'
];

// Form data interface
interface EditFormData {
  name: string;
  categoryId: string;
  purchasePrice: string;
  purchaseDate: string;
  expectedLife: string;
  enableExpectedLife: boolean;
  notes: string;
  imageUrl: string;
  icon: string;
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const itemId = params?.id as string;

  // State management
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Form data
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    categoryId: '',
    purchasePrice: '',
    purchaseDate: '',
    expectedLife: '',
    enableExpectedLife: false,
    notes: '',
    imageUrl: '',
    icon: '📱',
  });

  // Calculate daily cost
  const dailyCost = formData.purchasePrice
    ? (parseFloat(formData.purchasePrice) / 365).toFixed(2)
    : '0.00';

  // Check login status
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Fetch categories and item details
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !itemId) return;

      try {
        setLoading(true);

        // Fetch categories and item details in parallel
        const [categoriesRes, itemRes] = await Promise.all([
          itemsApi.getCategories(),
          itemsApi.getItem(itemId),
        ]);

        // Handle categories
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        // Handle item details
        if (itemRes.success && itemRes.data) {
          const itemData = itemRes.data as Item;
          setItem(itemData);

          // Fill form
          setFormData({
            name: itemData.name,
            categoryId: itemData.categoryId,
            purchasePrice: itemData.purchasePrice.toString(),
            purchaseDate: itemData.purchaseDate.split('T')[0], // Extract date only
            expectedLife: itemData.expectedLife ? itemData.expectedLife.toString() : '',
            enableExpectedLife: !!itemData.expectedLife,
            notes: itemData.notes || '',
            imageUrl: itemData.imageUrl || '',
            icon: itemData.icon || '📦',
          });
        } else {
          toast({
            title: 'Failed to Load',
            description: 'Unable to load item information',
            variant: 'destructive',
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Loading Failed',
          description: 'Unable to load data, please try again',
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

  // Update form field
  const updateField = (field: keyof EditFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save update
  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.categoryId || !formData.purchasePrice || !formData.purchaseDate) {
      toast({
        title: 'Validation Failed',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        categoryId: formData.categoryId,
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        notes: formData.notes || undefined,
        imageUrl: formData.imageUrl || undefined,
        icon: formData.icon,
        expectedLife:
          formData.enableExpectedLife && formData.expectedLife
            ? parseInt(formData.expectedLife)
            : undefined,
      };

      const response = await itemsApi.updateItem(itemId, updateData);

      if (response.success) {
        toast({
          title: 'Updated Successfully',
          description: 'Item information has been updated',
        });
        router.push(`/items/${itemId}`);
      } else {
        toast({
          title: 'Update Failed',
          description: response.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      toast({
        title: 'Update Failed',
        description: 'Please check network connection and try again',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Item</h1>
            <p className="text-sm text-muted-foreground">Modify item information</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-3xl space-y-6">
          {/* 基础信息 */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., iPhone 15 Pro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => updateField('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select a category" />
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Optional, brief description of the item"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 购买与保修 */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => updateField('purchasePrice', e.target.value)}
                    placeholder="¥"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
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
                    Enable expected lifespan
                  </Label>
                </div>
                {formData.enableExpectedLife && (
                  <Input
                    id="expectedLife"
                    type="number"
                    value={formData.expectedLife}
                    onChange={(e) => updateField('expectedLife', e.target.value)}
                    placeholder="Expected days of use"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyCost">Daily Cost (Auto-calculated)</Label>
                <Input
                  id="dailyCost"
                  value={dailyCost ? `¥${dailyCost}/day` : ''}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Icon Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Icon</CardTitle>
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
                  {showIconPicker ? 'Hide Icons' : 'Select Icon'}
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

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/items/${itemId}`)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

