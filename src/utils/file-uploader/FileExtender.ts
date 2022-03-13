import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileExtender implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        req.file['author'] = req.body.author;
        req.file['title'] = req.body.title;
        req.file['url'] = req.body.url;
        req.file['license'] = req.body.license;
        return next.handle();
    }
}
