import { Injectable } from '@nestjs/common';
import { PrismaService } from './modules/database/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDatabaseStatus() {
    try {
      // 测试数据库连接
      await this.prisma.$queryRaw`SELECT 1`;
      // 获取数据库信息
      const dbInfo = await this.prisma.$queryRaw`
        SELECT 
          current_database() as database_name,
          version() as version,
          current_user as current_user
      `;

      return {
        status: 'connected',
        message: 'Database connection successful',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        database: dbInfo[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
