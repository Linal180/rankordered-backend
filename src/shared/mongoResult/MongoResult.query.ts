import { OperationResult } from './OperationResult';

export class MongoResultQuery<T> {
    data: T;
    count?: number;
    status: OperationResult;
}
