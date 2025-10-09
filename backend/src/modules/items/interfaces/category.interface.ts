// src/modules/items/interfaces/category.interface.ts

/**
 * 分类统计接口 - Category statistics interface
 */
export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  totalValue: number; // 该分类下所有物品的总价值
}

/**
 * 分类查询结果 - Category with item count
 */
export interface CategoryWithCount {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    items: number;
  };
}
