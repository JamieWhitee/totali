/**
 * Redis 配置 - Redis configuration
 * 用于 AI 询价缓存等功能 - Used for AI pricing cache and other features
 */
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'totali:',
  ttl: parseInt(process.env.REDIS_TTL, 10) || 300, // 5 minutes default
}));
