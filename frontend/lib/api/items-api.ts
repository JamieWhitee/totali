import { apiClient } from './api-client';
import { type ApiResponse } from '@/types';

/**
 * 分类接口 - Category interface
 */
export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

/**
 * 物品接口 - Item interface
 */
export interface Item {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  purchasePrice: number;
  purchaseDate: string;
  expectedLife?: number | null;
  notes?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  status: 'ACTIVE' | 'IDLE' | 'EXPIRED' | 'SOLD';
  soldPrice?: number | null;
  soldDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  category?: Category;
}

/**
 * 物品统计接口 - Item with statistics
 */
export interface ItemWithStats extends Item {
  daysUsed: number;
  dailyCost: number;
  usageEfficiency: number | null;
}

/**
 * 分页物品列表接口 - Paginated items interface
 */
export interface PaginatedItems {
  items: ItemWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 用户物品概览统计接口 - User items overview interface
 */
export interface UserItemsOverview {
  totalItems: number;
  totalValue: number;
  averageDailyCost: number;
  activeItems: number;
  retiredItems: number;
  soldItems: number;
}

/**
 * 创建物品DTO - Create item DTO
 */
export interface CreateItemDto {
  name: string;
  categoryId: string;
  purchasePrice: number;
  purchaseDate: string;
  expectedLife?: number;
  notes?: string;
  imageUrl?: string;
}

/**
 * 效率分析物品接口 - Efficiency analysis item interface
 */
export interface EfficiencyItem {
  id: string;
  name: string;
  categoryIcon: string;
  categoryName: string;
  usageEfficiency: number;
  dailyCost: number;
  daysUsed: number;
  purchasePrice: number;
}

/**
 * 效率分析接口 - Efficiency analytics interface
 */
export interface EfficiencyAnalytics {
  topEfficient: EfficiencyItem[];
  leastEfficient: EfficiencyItem[];
  overallUsageRate: number;
}

/**
 * 分类效率统计接口 - Category efficiency statistics interface
 */
export interface CategoryEfficiency {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  itemCount: number;
  averageEfficiency: number;
  totalValue: number;
  averageDailyCost: number;
}

/**
 * 分类效率对比接口 - Category efficiency comparison interface
 */
export interface CategoryEfficiencyComparison {
  categories: CategoryEfficiency[];
}

/**
 * 趋势数据点接口 - Trend data point interface
 */
export interface TrendDataPoint {
  date: string;
  newItems: number;
  totalItems: number;
  newItemsValue: number;
  totalValue: number;
}

/**
 * 趋势分析接口 - Trend analytics interface
 */
export interface TrendAnalytics {
  dataPoints: TrendDataPoint[];
  days: number;
}

/**
 * 物品管理 API - Items management API
 */
export const itemsApi = {
  /**
   * 获取分类列表 - Get categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/categories');
  },

  /**
   * 创建物品 - Create item
   */
  async createItem(data: CreateItemDto): Promise<ApiResponse<Item>> {
    return apiClient.post<Item>('/items', data);
  },

  /**
   * 获取物品列表 - Get items
   */
  async getItems(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedItems>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    return apiClient.get<PaginatedItems>(`/items${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * 获取用户物品概览统计 - Get user items overview
   */
  async getItemsOverview(): Promise<ApiResponse<UserItemsOverview>> {
    return apiClient.get<UserItemsOverview>('/items/statistics/overview');
  },

  /**
   * 获取物品详情 - Get item by ID
   */
  async getItem(id: string): Promise<ApiResponse<Item>> {
    return apiClient.get<Item>(`/items/${id}`);
  },

  /**
   * 更新物品 - Update item
   */
  async updateItem(id: string, data: Partial<CreateItemDto>): Promise<ApiResponse<Item>> {
    return apiClient.patch<Item>(`/items/${id}`, data);
  },

  /**
   * 删除物品 - Delete item
   */
  async deleteItem(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/items/${id}`);
  },

  /**
   * 获取效率分析数据 - Get efficiency analytics
   */
  async getEfficiencyAnalytics(limit?: number, days?: number): Promise<ApiResponse<EfficiencyAnalytics>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (days) params.append('days', days.toString());
    const queryString = params.toString();
    return apiClient.get<EfficiencyAnalytics>(`/items/analytics/efficiency${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * 获取分类效率对比 - Get category efficiency comparison
   */
  async getCategoryEfficiencyComparison(): Promise<ApiResponse<CategoryEfficiencyComparison>> {
    return apiClient.get<CategoryEfficiencyComparison>('/items/analytics/categories');
  },

  /**
   * 获取趋势分析数据 - Get trend analytics
   */
  async getTrendAnalytics(days?: number): Promise<ApiResponse<TrendAnalytics>> {
    const queryString = days ? `?days=${days}` : '';
    return apiClient.get<TrendAnalytics>(`/items/analytics/trend${queryString}`);
  },
};

