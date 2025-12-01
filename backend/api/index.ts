import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

const server = express();
let cachedApp: any = null;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const logger = new Logger('Serverless');
  
  try {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { 
        logger: ['error', 'warn', 'log'],
        bufferLogs: true,
      }
    );

    // CORS 配置
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      credentials: true,
    });

    // 安全中间件
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      })
    );

    // 压缩
    app.use(compression());

    // Cookie 解析
    app.use(cookieParser());

    // 全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    // 全局异常过滤器
    app.useGlobalFilters(new GlobalExceptionFilter());

    // API 前缀
    app.setGlobalPrefix('api/v1');

    await app.init();
    cachedApp = app;
    
    logger.log('✅ NestJS app initialized for Serverless');
    return app;
  } catch (error) {
    logger.error('❌ Failed to initialize NestJS app', error);
    throw error;
  }
}

export default async (req: Request, res: Response) => {
  await bootstrap();
  return server(req, res);
};
