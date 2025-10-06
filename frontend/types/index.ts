// Common types for the application

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

/**
 * 后端统一API响应格式 - Backend unified API response format
 * 对应后端的 ApiResponseDto<T>
 */
export interface ApiResponse<T> {
  success: boolean;          // 请求是否成功 - Request success status
  data?: T;                  // 响应数据 - Response data
  message?: string;          // 响应消息 - Response message
  error?: string;            // 错误信息 - Error message
}

/**
 * API错误类型 - API error type
 */
export interface ApiError {
  message: string;           // 错误消息 - Error message
  status: number;            // HTTP状态码 - HTTP status code
  code?: string;             // 错误代码 - Error code
  error?: string;            // 后端返回的错误详情 - Backend error details
}

// 导出其他类型
export * from './auth';
export * from './item';