import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ComparisonItemCreatedEvent } from '../../comparisonItem/events/ComparisonItemCreated.event';
import { ComparisonItemDeletedEvent } from '../../comparisonItem/events/ComparisonItemDeleted.event';
import { ComparisonItemUpdatedEvent } from '../../comparisonItem/events/ComparisonItemUpdated.event';
import { VotingCreatedEvent } from '../../voting/events/VotingCreated.event';
import { ItemScoreV1Service } from '../v1/item-score-v1.service';

@Injectable()
export class ItemScoreListener {
    constructor(private itemScoreService: ItemScoreV1Service) { }

    @OnEvent('ComparisonItem.created')
    handleComparisonItemCreatedEvent(event: ComparisonItemCreatedEvent) {
        // create first score for this id and category
        if (event.category.length) {
            event.category.forEach((category) =>
                this.itemScoreService.findAndCreateScore(event.id, category)
            );
        }
    }

    @OnEvent('ComparisonItem.updated')
    handleComparisonItemUpdatedEvent(event: ComparisonItemUpdatedEvent) {
        // create first score for this id and category
        if (event.category.length) {
            event.category.forEach((category) =>
                this.itemScoreService.findAndCreateScore(event.id, category)
            );
        }
    }

    @OnEvent('ComparisonItem.deleted')
    handleComparisonItemDeleted(event: ComparisonItemDeletedEvent) {
        this.itemScoreService.deleteScoreByItemId(event.id);
    }

    @OnEvent('Voting.Created')
    async handleVotingItemCreatedEvent(event: VotingCreatedEvent) {
        await this.itemScoreService.updateScore(
            event.contestantId,
            event.categoryId,
            event.contestantCurrentSCore
        );

        await this.itemScoreService.updateScore(
            event.opponentId,
            event.categoryId,
            event.opponentCurrentSCore
        );
    }
}
