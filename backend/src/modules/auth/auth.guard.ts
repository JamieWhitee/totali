// src/modules/auth/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthUser } from './interface/auth.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();

    // 提取authorization头 - Extract authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token required');
    }

    if (typeof authHeader !== 'string') {
      throw new UnauthorizedException('Invalid authorization header');
    }

    // 分割Bearer token - Split Bearer token
    const headerParts = authHeader.split(' ');
    if (headerParts.length !== 2) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const tokenType = headerParts[0];
    const token = headerParts[1];

    if (tokenType !== 'Bearer') {
      throw new UnauthorizedException('Bearer token required');
    }

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    // 验证token - Validate token
    const user = await this.authService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 将用户信息添加到请求中 - Add user info to request
    request.user = user;
    return true;
  }
}
