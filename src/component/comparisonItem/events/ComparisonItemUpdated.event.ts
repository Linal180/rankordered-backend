import { Data } from 'dataclass';

export class ComparisonItemUpdatedEvent extends Data {
    id: string;
    category?: string[];
}
