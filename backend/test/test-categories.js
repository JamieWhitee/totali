/**
 * 分类管理API自动化测试脚本
 * 使用 Supabase 登录获取 JWT token，然后测试4个分类管理API
 */

const https = require('https');
const http = require('http');

// 配置 - 从环境变量读取敏感信息
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const API_BASE_URL = 'http://localhost:3001/api/v1';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求封装
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// 登录获取JWT token
async function login(email, password) {
  log('\n[步骤 1] 登录 Supabase 获取 JWT token...', 'blue');
  
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const response = await request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: { email, password },
  });

  if (response.data.access_token) {
    log(`✓ 登录成功！用户: ${email}`, 'green');
    log(`✓ Token: ${response.data.access_token.substring(0, 50)}...`, 'green');
    return response.data.access_token;
  } else {
    throw new Error(`登录失败: ${JSON.stringify(response.data)}`);
  }
}

// 测试分类API
async function testCategoriesAPI(token) {
  log('\n=================================', 'blue');
  log('开始测试分类管理 API', 'blue');
  log('=================================\n', 'blue');

  let createdCategoryId = null;

  // 测试1: 获取分类列表
  try {
    log('[测试 1/4] GET /categories - 获取分类列表', 'yellow');
    const response = await request(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    log(`状态码: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`响应: ${JSON.stringify(response.data, null, 2)}`, 'green');
    log('');
  } catch (error) {
    log(`✗ 错误: ${error.message}`, 'red');
  }

  // 测试2: 创建新分类
  try {
    log('[测试 2/4] POST /categories - 创建新分类', 'yellow');
    const response = await request(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        name: `测试分类_${Date.now()}`,
        icon: '📦',
      },
    });
    log(`状态码: ${response.status}`, response.status === 200 || response.status === 201 ? 'green' : 'red');
    log(`响应: ${JSON.stringify(response.data, null, 2)}`, 'green');
    
    if (response.data.data && response.data.data.id) {
      createdCategoryId = response.data.data.id;
      log(`✓ 创建的分类ID: ${createdCategoryId}`, 'green');
    }
    log('');
  } catch (error) {
    log(`✗ 错误: ${error.message}`, 'red');
  }

  // 测试3: 获取分类统计
  if (createdCategoryId) {
    try {
      log('[测试 3/4] GET /categories/:id/stats - 获取分类统计', 'yellow');
      const response = await request(`${API_BASE_URL}/categories/${createdCategoryId}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      log(`状态码: ${response.status}`, response.status === 200 ? 'green' : 'red');
      log(`响应: ${JSON.stringify(response.data, null, 2)}`, 'green');
      log('');
    } catch (error) {
      log(`✗ 错误: ${error.message}`, 'red');
    }
  } else {
    log('[测试 3/4] 跳过 - 未创建分类', 'yellow');
  }

  // 测试4: 删除分类
  if (createdCategoryId) {
    try {
      log('[测试 4/4] DELETE /categories/:id - 删除分类', 'yellow');
      const response = await request(`${API_BASE_URL}/categories/${createdCategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      log(`状态码: ${response.status}`, response.status === 200 ? 'green' : 'red');
      log(`响应: ${JSON.stringify(response.data, null, 2)}`, 'green');
      log('');
    } catch (error) {
      log(`✗ 错误: ${error.message}`, 'red');
    }
  } else {
    log('[测试 4/4] 跳过 - 未创建分类', 'yellow');
  }

  log('=================================', 'blue');
  log('测试完成！', 'green');
  log('=================================\n', 'blue');
}

// 主函数
async function main() {
  try {
    // 从命令行参数获取邮箱和密码
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      log('用法: node test-categories.js <email> <password>', 'yellow');
      log('示例: node test-categories.js test@example.com password123', 'yellow');
      process.exit(1);
    }

    const token = await login(email, password);
    await testCategoriesAPI(token);
  } catch (error) {
    log(`\n✗ 错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();

