import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loggerConfig } from './config/logger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 创建应用实例
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
    // 不在这里启用CORS，在后面统一配置
  });

  // CORS配置 - 必须在helmet之前配置
  const allowedOrigins = ['http://localhost:3000', 'https://totali-front.vercel.app', process.env.FRONTEND_URL].filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  // 安全头配置 - 配置helmet以允许CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );

  // 响应压缩
  app.use(compression());

  // Cookie解析器
  app.use(cookieParser());

  // 请求体大小限制
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    })
  );

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局响应拦截器
  //app.useGlobalInterceptors(new ResponseInterceptor());

  // API前缀
  app.setGlobalPrefix('api/v1', {
    exclude: ['/docs'], // 排除Swagger文档路径
  });

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('Totali API')
    .setDescription('个人物品价值追踪系统 API 文档')
    .setVersion('1.0')
    .addTag('auth', '用户认证')
    .addTag('users', '用户管理')
    .addTag('items', '物品管理')
    .addTag('categories', '分类管理')
    .addTag('usage-records', '使用记录')
    .addTag('analytics', '数据分析')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addServer('http://localhost:3001', '开发环境')
    .addServer('https://api.totali.com', '生产环境')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Totali API Documentation',
  });

  // 启动应用
  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`�� API Documentation: http://localhost:${port}/docs`);
  logger.log(`�� Environment: ${process.env.NODE_ENV || 'development'}`);
}

void bootstrap();
