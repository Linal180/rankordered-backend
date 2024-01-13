import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FavoriteItem, FavoriteItemDocument } from "../schemas/favoriteItem.schema";
import { Model } from "mongoose";
import { MongoResultQuery } from "src/shared/mongoResult/MongoResult.query";
import { OperationResult } from "src/shared/mongoResult/OperationResult";
import { PaginationDto } from "src/shared/pagination/Pagination.dto";
import { ComparisonItem } from "src/component/comparisonItem/schemas/ComparisonItem.schema";
import { ComparisonItemV1Service } from "src/component/comparisonItem/v1/comparison-item-v1.service";

@Injectable()
export class FavoriteItemV1Service {
  constructor(
    @InjectModel(FavoriteItem.name) private favoriteModel: Model<FavoriteItemDocument>,
    private comparisonService: ComparisonItemV1Service
  ) { }

  /** 
   * 
   */
  async create(userId: string, itemId: string): Promise<MongoResultQuery<FavoriteItem>> {
    const res = new MongoResultQuery<FavoriteItem>();

    try {
      const existed = await this.favoriteModel.findOne({ user: userId, comparisonItem: itemId })

      if (existed) {
        res.data = existed;
      } else {
        const newFavorite = await this.favoriteModel.create({ user: userId, comparisonItem: itemId });
        res.data = newFavorite;
      }

      res.status = OperationResult.create;
      return res;

    } catch (error) {
      console.log(error)
    }
  }

  async delete(userId: string, itemId: string): Promise<MongoResultQuery<FavoriteItem>> {
    const res = new MongoResultQuery<FavoriteItem>();

    try {
      res.data = await this.favoriteModel.findOneAndDelete({ user: userId, comparisonItem: itemId })
      res.status = OperationResult.delete;

      return res;
    } catch (error) {
      console.log(error)
    }
  }

  async get({ userId, pagination, categoryId, search }: { userId: string, categoryId: string, search: string, pagination: PaginationDto }): Promise<MongoResultQuery<ComparisonItem[]>> {
    try {
      if (!userId)
        throw new BadRequestException();

      const favorites = await this.favoriteModel.find({ user: userId }, { comparisonItem: 1 })
        .sort({ createdAt: -1 })
        .exec();

      const ids: string[] = favorites.map(favorite => favorite.comparisonItem.toString());

      if (ids.length) {
        const comparisonResponse = await this.comparisonService.findAllWithRankingFromSnapshotOptimized({ categoryId, pagination, search, ids, favorite: true })

        return comparisonResponse;
      } else throw new NotFoundException();
    } catch (error) {
      console.log(error)
    }
  }

  async checkFavorite(userId: string, itemId: string): Promise<MongoResultQuery<FavoriteItem>> {
    if (!userId)
      throw new BadRequestException();

    const res = new MongoResultQuery<FavoriteItem>();

    try {
      const favorite = await this.favoriteModel.findOne({ user: userId, comparisonItem: itemId })
        .sort({ createdAt: -1 })
        .exec();

      if (favorite) {
        res.data = favorite;
        res.status = OperationResult.fetch
      }

      return res;
    } catch (error) {
      throw new NotFoundException()
    }
  }
}