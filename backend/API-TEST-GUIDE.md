# 分类管理 API 测试指南

## 方法一：使用 Swagger UI（推荐）🎯

这是最简单直观的测试方法，完全基于浏览器UI操作。

### 步骤：

#### 1. 获取 JWT Token

1. 访问前端：http://localhost:3000
2. 使用测试账号登录：
   - 邮箱：`ibb11@test.com`
   - 密码：`123456`
3. 登录成功后，打开浏览器开发者工具（按F12）
4. 切换到 **Console** 标签
5. 执行以下命令：
   ```javascript
   JSON.parse(localStorage.getItem('sb-sqncmyhrzigvebvvarbf-auth-token')).access_token;
   ```
6. 复制输出的 token（一个很长的字符串）

#### 2. 使用 Swagger UI 测试

1. 访问 Swagger UI：http://localhost:3001/docs
2. 点击右上角的 **Authorize** 按钮
3. 在弹出的对话框中，输入：`Bearer <YOUR_TOKEN>`
   - 注意：要包含 "Bearer " 前缀和一个空格
   - 例如：`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...`
4. 点击 **Authorize** 确认
5. 现在可以测试分类API了！

#### 3. 测试 4 个分类 API

##### 测试 1：获取分类列表

1. 找到 `GET /api/v1/categories`
2. 点击 **Try it out**
3. 点击 **Execute**
4. 查看响应结果

##### 测试 2：创建新分类

1. 找到 `POST /api/v1/categories`
2. 点击 **Try it out**
3. 修改请求体：
   ```json
   {
     "name": "我的测试分类",
     "icon": "🎮"
   }
   ```
4. 点击 **Execute**
5. 查看响应，记住返回的 `id`

##### 测试 3：获取分类统计

1. 找到 `GET /api/v1/categories/{id}/stats`
2. 点击 **Try it out**
3. 输入上一步创建的分类 ID
4. 点击 **Execute**
5. 查看响应结果（应该显示物品数量为0）

##### 测试 4：删除分类

1. 找到 `DELETE /api/v1/categories/{id}`
2. 点击 **Try it out**
3. 输入分类 ID
4. 点击 **Execute**
5. 查看响应结果

---

## 方法二：使用自动化测试脚本⚡

如果您更喜欢命令行，可以使用测试脚本。

### 步骤：

#### 1. 获取 JWT Token（同上）

按照方法一的步骤1获取 token

#### 2. 运行测试脚本

```bash
cd /Users/ibairah/vscodeprojects/totali/backend
node test/test-categories-simple.js <YOUR_TOKEN>
```

将 `<YOUR_TOKEN>` 替换为您从前端获取的实际 token。

### 示例：

```bash
node test/test-categories-simple.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

脚本会自动测试所有4个API并显示结果。

---

## 预期结果

所有4个测试都应该通过：

✅ **测试 1**: 获取分类列表

- 应该返回系统预设的6个分类：电子产品、服装配饰、生活用品、运动健身、书籍文具、其他

✅ **测试 2**: 创建新分类

- 应该成功创建，返回新分类的完整信息（包含 id、name、icon 等）

✅ **测试 3**: 获取分类统计

- 应该返回分类信息和统计数据（itemCount: 0，因为还没有添加物品）

✅ **测试 4**: 删除分类

- 应该成功删除（系统预设分类不能删除，只能删除自己创建的分类）

---

## 常见问题

### Q: Token 过期了怎么办？

A: JWT token 默认有效期为1小时。如果过期，重新登录前端获取新 token即可。

### Q: 无法删除分类？

A: 系统预设分类（isSystem: true）不能删除，只能删除自己创建的分类。

### Q: Swagger UI 显示 401 Unauthorized？

A: 检查 token 是否正确，是否包含 "Bearer " 前缀。

---

## 服务地址

- 前端：http://localhost:3000
- 后端 API：http://localhost:3001/api/v1
- Swagger UI：http://localhost:3001/docs
