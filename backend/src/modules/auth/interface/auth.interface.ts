/**
 * 认证模块类型定义 - Authentication module type definitions
 * 供应商无关的认证接口设计 - Vendor-agnostic authentication interface design
 */

/**
 * 标准用户信息接口 - Standard user information interface
 * 应用内部使用的标准用户格式 - Standard user format used internally in the application
 */
export interface AuthUser {
  /** 用户ID - User ID */
  id: string;
  /** 用户邮箱 - User email */
  email: string;
  /** 用户姓名（可选） - User name (optional) */
  name?: string;
  /** 头像URL（可选） - Avatar URL (optional) */
  avatarUrl?: string;
}

/**
 * JWT载荷接口 - JWT payload interface
 * JWT Token中包含的标准载荷信息 - Standard payload information contained in JWT Token
 */
export interface JwtPayload extends AuthUser {
  /** Token发布时间 - Token issued at */
  iat?: number;
  /** Token过期时间 - Token expires at */
  exp?: number;
  /** 发布者 - Issuer */
  iss?: string;
}

/**
 * 外部认证供应商用户接口 - External auth provider user interface
 * 用于适配不同认证供应商的通用接口 - Generic interface for adapting different auth providers
 */
export interface ExternalAuthUser {
  /** 外部用户ID - External user ID */
  id: string;
  /** 用户邮箱 - User email */
  email: string;
  /** 用户元数据 - User metadata */
  metadata: Record<string, unknown>;
  /** 外部供应商标识 - External provider identifier */
  provider: 'supabase' | 'firebase' | 'auth0' | 'custom';
  /** 原始用户数据 - Raw user data */
  rawUserData: Record<string, unknown>;
}

/**
 * 认证供应商适配器接口 - Auth provider adapter interface
 * 定义认证供应商必须实现的方法 - Defines methods that auth providers must implement
 */
export interface AuthProviderAdapter {
  /**
   * 验证JWT Token - Validate JWT Token
   * @param token - JWT token string
   * @returns Promise of auth user or null
   */
  validateToken(token: string): Promise<AuthUser | null>;

  /**
   * 解析外部用户数据 - Parse external user data
   * @param externalUser - External user data
   * @returns Standard auth user format
   */
  parseExternalUser(externalUser: ExternalAuthUser): AuthUser;

  /**
   * 获取供应商配置 - Get provider configuration
   * @returns Provider configuration object
   */
  getProviderConfig(): AuthProviderConfig;
}

/**
 * 认证供应商配置接口 - Auth provider configuration interface
 * 不同供应商的配置参数 - Configuration parameters for different providers
 */
export interface AuthProviderConfig {
  /** 供应商类型 - Provider type */
  provider: 'supabase' | 'firebase' | 'auth0' | 'custom';
  /** 项目URL或域名 - Project URL or domain */
  projectUrl: string;
  /** API密钥 - API key */
  apiKey: string;
  /** JWT密钥（可选） - JWT secret (optional) */
  jwtSecret?: string;
  /** 额外配置 - Additional configuration */
  additionalConfig?: Record<string, unknown>;
}

/**
 * 认证请求接口 - Authenticated request interface
 * 经过认证守卫处理后的请求对象 - Request object after authentication guard processing
 */
export interface AuthenticatedRequest {
  /** 请求中的用户信息 - User information in request */
  user: AuthUser;
}

/**
 * JWT验证结果接口 - JWT validation result interface
 * 用于Guard和Service之间的数据传递 - Used for data transfer between Guard and Service
 */
export interface JwtValidationResult {
  /** 是否验证成功 - Whether validation succeeded */
  success: boolean;
  /** 用户信息（验证成功时） - User info (when validation succeeds) */
  user?: AuthUser;
  /** 错误信息（验证失败时） - Error message (when validation fails) */
  error?: string;
}

/**
 * 用户同步响应接口 - User sync response interface
 * 用户数据同步到本地数据库后的响应 - Response after syncing user data to local database
 */
export interface UserSyncResponse {
  /** 用户ID - User ID */
  id: string;
  /** 用户邮箱 - User email */
  email: string;
  /** 用户姓名 - User name */
  name: string;
  /** 是否为新创建用户 - Whether user was newly created */
  isNewUser: boolean;
  /** 同步时间戳 - Sync timestamp */
  syncedAt: Date;
  /** 原始供应商 - Original provider */
  provider: string;
}

/**
 * Supabase特定用户接口 - Supabase specific user interface
 * 仅在Supabase适配器中使用 - Only used in Supabase adapter
 */
export interface SupabaseUser extends ExternalAuthUser {
  provider: 'supabase';
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
  app_metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Firebase特定用户接口 - Firebase specific user interface
 * 仅在Firebase适配器中使用 - Only used in Firebase adapter
 */
export interface FirebaseUser extends ExternalAuthUser {
  provider: 'firebase';
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

/**
 * Auth0特定用户接口 - Auth0 specific user interface
 * 仅在Auth0适配器中使用 - Only used in Auth0 adapter
 */
export interface Auth0User extends ExternalAuthUser {
  provider: 'auth0';
  name?: string;
  picture?: string;
  email_verified: boolean;
  sub: string;
}
