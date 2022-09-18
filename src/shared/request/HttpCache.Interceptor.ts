import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
    trackBy(context: ExecutionContext): string | undefined {
        const req = context.getArgByIndex(0);
        if (!req.url.includes('&timestamp')) {
            return req.url;
        }
        return req.url.slice(0, req.url.indexOf('&timestamp'));
    }
}
