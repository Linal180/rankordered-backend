import { Data } from 'dataclass';

export class CreateSnapshotDto extends Data {
    itemId: string;
    categoryId: string;
    score: number;
    ranking: number;
    date: Date;
}
