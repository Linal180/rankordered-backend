import { ItemScore } from '../../item-score/schemas/item-score.schema';
import { ComparisonItemDocument } from './ComparisonItem.schema';

export interface ComparisonItemWithScore extends ComparisonItemDocument {
    score: ItemScore;
    ranking?: number;
}
