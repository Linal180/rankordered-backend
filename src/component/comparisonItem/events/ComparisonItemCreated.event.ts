import { Data } from 'dataclass';

export class ComparisonItemCreatedEvent extends Data {
    id: string;
    category: string[];
}
