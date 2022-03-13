import { Data } from 'dataclass';

export class VotingCreatedEvent extends Data {
    contestantId: string;
    contestantCurrentSCore: number;
    opponentId: string;
    opponentCurrentSCore: number;
    categoryId: string;
}
