// src/modules/items/interfaces/item.interface.ts

/**
 * 物品统计数据接口 - Item statistics interface
 */
export interface ItemStatistics {
  itemId: string;
  itemName: string;
  daysUsed: number; // 使用天数
  dailyCost: number; // 日均成本
  totalValue: number; // 总价值（购买价格）
  currentValue: number; // 当前价值（如果已卖出）
  usageFrequency: number; // 使用频率（从 UsageRecord 计算）
  usageEfficiency: number | null; // 使用效率（实际使用天数/预计使用天数）
}

/**
 * 用户物品概览接口 - User items overview interface
 */
export interface UserItemsOverview {
  totalItems: number; // 总物品数
  totalValue: number; // 总价值
  averageDailyCost: number; // 平均日成本
  activeItems: number; // 服役中的物品数
  retiredItems: number; // 已退役的物品数
  soldItems: number; // 已卖出的物品数
}

/**
 * Prisma 查询条件接口 - Prisma where condition interface
 */
export interface ItemWhereCondition {
  userId: string;
  deletedAt: null;
  name?: {
    contains: string;
    mode: 'insensitive';
  };
  categoryId?: string;
  status?: string;
}
