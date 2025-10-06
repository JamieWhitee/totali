/**
 * Redis 服务 - Redis service
 * 用于缓存 AI 询价结果 - For caching AI pricing results
 */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { RedisConfig, AIPricingCache } from '../../types/redis.types';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = this.configService.get<RedisConfig>('redis');

    if (!redisConfig) {
      this.logger.warn(
        'Redis configuration not found, caching will be disabled',
      );
      return;
    }

    this.client = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password,
      database: redisConfig.db || 0,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });

    try {
      await this.client.connect();
      this.logger.log('Redis connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  /**
   * 缓存 AI 询价结果 - Cache AI pricing result
   */
  async cacheAIPricing(
    itemName: string,
    pricingData: AIPricingCache,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    if (!this.client) return;

    try {
      const key = `ai_pricing:${itemName}`;
      await this.client.setEx(key, ttlSeconds, JSON.stringify(pricingData));
    } catch (error) {
      this.logger.error('Failed to cache AI pricing:', error);
    }
  }

  /**
   * 获取缓存的 AI 询价结果 - Get cached AI pricing result
   */
  async getCachedAIPricing(itemName: string): Promise<AIPricingCache | null> {
    if (!this.client) return null;

    try {
      const key = `ai_pricing:${itemName}`;
      const cached = await this.client.get(key);

      if (!cached) return null;

      return JSON.parse(cached as string) as AIPricingCache;
    } catch (error) {
      this.logger.error('Failed to get cached AI pricing:', error);
      return null;
    }
  }

  /**
   * 检查是否有缓存的 AI 询价结果 - Check if AI pricing is cached
   */
  async hasCachedAIPricing(itemName: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const key = `ai_pricing:${itemName}`;
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error('Failed to check cached AI pricing:', error);
      return false;
    }
  }

  /**
   * 清除特定物品的缓存 - Clear cache for specific item
   */
  async clearAIPricingCache(itemName: string): Promise<void> {
    if (!this.client) return;

    try {
      const key = `ai_pricing:${itemName}`;
      await this.client.del(key);
    } catch (error) {
      this.logger.error('Failed to clear AI pricing cache:', error);
    }
  }
}
