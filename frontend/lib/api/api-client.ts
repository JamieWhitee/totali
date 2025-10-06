import { supabase } from '@/lib/supabase';
import { type ApiResponse, type ApiError } from '@/types';

class ApiClient {
  private readonly baseURL: string;

  constructor() {
    // 直接请求后端 API - Direct request to backend API
    // 生产环境使用环境变量，开发环境使用 localhost:3001
    // Version: 2.0 - 强制重新编译
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * 获取请求头，包含JWT token - Get request headers with JWT token
   */
  private async getHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 添加 Supabase JWT token - Add Supabase JWT token
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  /**
   * 处理响应，匹配后端 ApiResponseDto 格式 - Handle response matching backend ApiResponseDto format
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // 解析响应体 - Parse response body
    const responseData = await response.json();

    // 如果HTTP状态码不是2xx，抛出错误 - Throw error if HTTP status is not 2xx
    if (!response.ok) {
      const error: ApiError = {
        message: responseData.message || responseData.error || response.statusText,
        status: response.status,
        code: responseData.code,
        error: responseData.error,
      };
      throw error;
    }

    // 返回后端的响应格式 - Return backend response format
    // 后端已经返回 { success, data, message, error } 格式
    return responseData as ApiResponse<T>;
  }

  /**
   * GET 请求 - GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include', // 包含 cookies - Include cookies
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST 请求 - POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // 包含 cookies - Include cookies
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT 请求 - PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // 包含 cookies - Include cookies
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE 请求 - DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include', // 包含 cookies - Include cookies
    });

    return this.handleResponse<T>(response);
  }
}

// 导出单例实例 - Export singleton instance
export const apiClient = new ApiClient();