import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config')
  getConfig() {
    return {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      database: process.env.DATABASE_URL ? 'configured' : 'not configured',
      redis: process.env.REDIS_HOST ? 'configured' : 'not configured',
    };
  }

  @Get('database')
  async getDatabaseStatus() {
    return this.appService.getDatabaseStatus();
  }
}
