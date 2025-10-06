/**
 * Supabase 配置 - Supabase configuration
 * 仅用于认证 JWT 验证 - Only used for authentication JWT verification
 */
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (configService: ConfigService) => {
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Service Role Key must be provided');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
