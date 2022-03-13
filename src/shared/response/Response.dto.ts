import { Data } from 'dataclass';
import { OperationResult } from '../mongoResult/OperationResult';

export class ResponseDto<T> {
    data: T;
    link: LinkResponse;
    status: OperationResult;
    page_data?: PageData;
}

export class LinkResponse extends Data {
    _self: string;
    first?: string;
    next?: string;
    previous?: string;
    last?: string;
}

export class PageData extends Data {
    page: number;
    per_page: number;
    total_page: number;
    total_item: number;
}
