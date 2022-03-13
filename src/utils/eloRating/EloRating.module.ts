import { Module } from '@nestjs/common';
import { RatingSystemService } from './RatingSystem.service';

@Module({ providers: [RatingSystemService], exports: [RatingSystemService] })
export class EloRatingModule {}
