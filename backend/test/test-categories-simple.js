/**
 * 分类管理API测试脚本（简化版）
 * 直接使用提供的JWT token测试
 */

const http = require('http');

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
    const req = http.request(url, options, (res) => {
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

// 测试分类API
async function testCategoriesAPI(token) {
  log('\n=================================', 'blue');
  log('开始测试分类管理 API', 'blue');
  log('=================================\n', 'blue');

  let createdCategoryId = null;
  const results = {
    passed: 0,
    failed: 0,
  };

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
    
    if (response.status === 200 && response.data.success) {
      log('✓ 测试通过', 'green');
      results.passed++;
    } else {
      log('✗ 测试失败', 'red');
      results.failed++;
    }
    log('');
  } catch (error) {
    log(`✗ 错误: ${error.message}`, 'red');
    results.failed++;
    log('');
  }

  // 测试2: 创建新分类
  try {
    log('[测试 2/4] POST /categories - 创建新分类', 'yellow');
    const categoryName = `测试分类_${Date.now()}`;
    const response = await request(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: {
        name: categoryName,
        icon: '📦',
      },
    });
    log(`状态码: ${response.status}`, response.status === 200 || response.status === 201 ? 'green' : 'red');
    log(`响应: ${JSON.stringify(response.data, null, 2)}`, 'green');
    
    if ((response.status === 200 || response.status === 201) && response.data.success && response.data.data && response.data.data.id) {
      createdCategoryId = response.data.data.id;
      log(`✓ 测试通过 - 创建的分类ID: ${createdCategoryId}`, 'green');
      results.passed++;
    } else {
      log('✗ 测试失败', 'red');
      results.failed++;
    }
    log('');
  } catch (error) {
    log(`✗ 错误: ${error.message}`, 'red');
    results.failed++;
    log('');
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
      
      if (response.status === 200 && response.data.success) {
        log('✓ 测试通过', 'green');
        results.passed++;
      } else {
        log('✗ 测试失败', 'red');
        results.failed++;
      }
      log('');
    } catch (error) {
      log(`✗ 错误: ${error.message}`, 'red');
      results.failed++;
      log('');
    }
  } else {
    log('[测试 3/4] 跳过 - 未创建分类', 'yellow');
    log('');
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
      
      if (response.status === 200 && response.data.success) {
        log('✓ 测试通过', 'green');
        results.passed++;
      } else {
        log('✗ 测试失败', 'red');
        results.failed++;
      }
      log('');
    } catch (error) {
      log(`✗ 错误: ${error.message}`, 'red');
      results.failed++;
      log('');
    }
  } else {
    log('[测试 4/4] 跳过 - 未创建分类', 'yellow');
    log('');
  }

  log('=================================', 'blue');
  log(`测试完成！通过: ${results.passed}/${results.passed + results.failed}`, results.failed === 0 ? 'green' : 'yellow');
  log('=================================\n', 'blue');
  
  return results;
}

// 获取token的辅助函数
async function getTokenFromFrontend() {
  log('\n请从前端获取JWT token：', 'yellow');
  log('1. 访问 http://localhost:3000', 'yellow');
  log('2. 登录您的账号 (ibb11@test.com)', 'yellow');
  log('3. 打开浏览器开发者工具 (F12)', 'yellow');
  log('4. 在 Console 中执行:', 'yellow');
  log('   JSON.parse(localStorage.getItem(\'sb-sqncmyhrzigvebvvarbf-auth-token\')).access_token', 'blue');
  log('\n然后使用以下命令运行测试:', 'yellow');
  log('   node test/test-categories-simple.js <YOUR_TOKEN>', 'blue');
  log('');
}

// 主函数
async function main() {
  try {
    const token = process.argv[2];

    if (!token) {
      await getTokenFromFrontend();
      process.exit(0);
    }

    await testCategoriesAPI(token);
  } catch (error) {
    log(`\n✗ 错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();

