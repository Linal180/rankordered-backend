import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response.status(status).json({
            message: exception.message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            link: {
                _self: process.env.url + request.url
            }
        });
    }
}
