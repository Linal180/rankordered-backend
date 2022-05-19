import { ScoreSnapshotDocument } from 'src/component/scoresnapshot/schemas/score-snapshot.schema';
import { ItemScore } from '../../item-score/schemas/item-score.schema';
import { ComparisonItemDocument } from './ComparisonItem.schema';

export interface ComparisonItemWithScore extends ComparisonItemDocument {
    score: ItemScore;
    ranking?: number;
    scoreSnapshot: ScoreSnapshotDocument;
}
