// src/common/filters/global-exception.filter.ts (修复统一格式)
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../api-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    this.logger.error(`${request.method} ${request.url} - ${status}: ${message}`);

    // ✅ 使用统一的响应格式
    const errorResponse: ApiResponseDto<null> = {
      success: false,
      error: message,
    };

    response.status(status).json(errorResponse);
  }
}
