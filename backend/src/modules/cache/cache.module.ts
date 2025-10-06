/**
 * 缓存模块 - Cache module
 * 提供 Redis 缓存服务 - Provides Redis caching service
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class CacheModule {}
