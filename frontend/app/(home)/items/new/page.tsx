/* eslint-disable @typescript-eslint/no-unused-vars */
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewItemPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </Link>
        </div>

        <PageHeader
          title="添加新物品"
          description="记录您的个人物品信息"
        />

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>物品信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">物品名称 *</Label>
                  <Input id="name" placeholder="例如：MacBook Pro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">分类 *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">电子产品</SelectItem>
                      <SelectItem value="clothing">服装</SelectItem>
                      <SelectItem value="books">书籍</SelectItem>
                      <SelectItem value="furniture">家具</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">购买价值 *</Label>
                  <Input id="value" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">购买日期 *</Label>
                  <Input id="purchaseDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea 
                  id="description" 
                  placeholder="物品的详细描述..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button>保存物品</Button>
                <Button variant="outline">取消</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}