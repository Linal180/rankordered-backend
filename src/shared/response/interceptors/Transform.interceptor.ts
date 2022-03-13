import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { LinkResponse, PageData, ResponseDto } from '../Response.dto';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ResponseDto<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<ResponseDto<T>> {
        const req = context.switchToHttp().getRequest();
        return next.handle().pipe(
            map((data) => {
                const baseUrl = process.env.URL;

                const res = new ResponseDto<T>();

                res.data = data?.data;
                res.status = data?.status;

                const link = LinkResponse.create({
                    _self: baseUrl + req.originalUrl
                });

                if (data.count) {
                    const total_page = Math.ceil(data.count / req.query.limit);

                    res.page_data = PageData.create({
                        page: parseInt(req.query.page),
                        per_page: parseInt(req.query.limit),
                        total_item: data.count,
                        total_page: total_page
                    });

                    // link = link.copy({
                    //     first
                    // })
                }

                res.link = link;

                return res;
            })
        );
    }
}
