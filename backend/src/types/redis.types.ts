/**
 * Redis 类型定义 - Redis type definitions
 * 用于 AI 询价缓存 - For AI pricing cache
 */

// AI 询价缓存数据结构
export interface AIPricingCache {
  itemName: string;
  estimatedPrice: number;
  confidence: number;
  source: string;
  timestamp: number;
}

// Redis 配置类型
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}
