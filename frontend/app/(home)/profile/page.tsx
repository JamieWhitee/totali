import { PageLayout } from '@/components/layout/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'

export default function ProfilePage() {
  return (
    <PageLayout
      title="个人资料"
      description="管理您的个人信息"
      actions={<Button>保存更改</Button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 头像和基本信息 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>头像</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  更换头像
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 详细信息 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input id="name" placeholder="您的姓名" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Input id="bio" placeholder="介绍一下自己..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">电话</Label>
                  <Input id="phone" placeholder="手机号码" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">位置</Label>
                  <Input id="location" placeholder="所在城市" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}