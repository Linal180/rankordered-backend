import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { FavoriteItem, FavoriteItemSchema } from './schemas/favoriteItem.schema';
import { FavoriteItemV1Service } from './v1/favorite-item-v1.service';
import { FavoriteItemV1Controller } from './v1/favorite-item-v1.controller';
import { ComparisonItemModule } from '../comparisonItem/comparison-item.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FavoriteItem.name, schema: FavoriteItemSchema }]),
    UserModule,
    ComparisonItemModule,
  ],

  providers: [FavoriteItemV1Service],
  controllers: [FavoriteItemV1Controller],
  exports: [FavoriteItemV1Service]
})
export class FavoriteItemModule { }
