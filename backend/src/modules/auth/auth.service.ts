// src/modules/auth/auth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { AuthUser, SupabaseUser } from './interface/auth.interface';
import { SyncUserDto, UserSyncData } from './dto/sync-user.dto';
import { createSuccessResponse, ApiResponseDto } from '../../common/api-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly supabase = this.createSupabaseClient();

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('AuthService initialized successfully');
  }

  private createSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const { data: userResponse, error } = await this.supabase.auth.getUser(token);

      if (error || !userResponse?.user) {
        this.logger.warn(`JWT validation failed: ${error?.message || 'Unknown error'}`);
        return null;
      }

      const supabaseUser = userResponse.user as unknown as SupabaseUser;
      const authUser: AuthUser = this.parseSupabaseUserToAuthUser(supabaseUser);

      this.logger.log(`JWT validation successful for user: ${authUser.email}`);
      return authUser;
    } catch (error) {
      this.logger.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * 同步用户到本地数据库 - Sync user to local database
   */
  async syncUserToLocal(syncUserDto: SyncUserDto): Promise<ApiResponseDto<UserSyncData>> {
    try {
      this.logger.log(`Starting user sync for: ${syncUserDto.email}`);

      // 检查用户是否已存在 - Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: syncUserDto.id },
      });

      if (existingUser) {
        this.logger.log(`User already exists: ${existingUser.email}`);

        const userData: UserSyncData = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          avatarUrl: existingUser.avatarUrl,
          createdAt: existingUser.createdAt.toISOString(),
          updatedAt: existingUser.updatedAt.toISOString(),
        };

        return createSuccessResponse(userData, 'User already exists');
      }

      // 创建新用户 - Create new user (修复：返回正确的用户信息)
      const newUser = await this.prisma.user.create({
        data: {
          id: syncUserDto.id,
          email: syncUserDto.email,
          name: syncUserDto.name || null,
          avatarUrl: syncUserDto.avatarUrl || null,
          // 移除手动时间戳，让Prisma自动处理
        },
      });

      this.logger.log(`Created new user: ${newUser.email}`);

      const userData: UserSyncData = {
        id: newUser.id, // ✅ 修复：使用newUser而不是existingUser
        email: newUser.email, // ✅ 修复：使用newUser
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      };

      return createSuccessResponse(userData, 'User created successfully');
    } catch (error) {
      this.logger.error('Failed to sync user to local database:', error);
      throw new Error('User synchronization failed');
    }
  }

  private parseSupabaseUserToAuthUser(supabaseUser: SupabaseUser): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
    };
  }
}
