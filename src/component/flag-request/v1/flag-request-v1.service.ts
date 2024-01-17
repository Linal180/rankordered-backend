import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FlagRequest, FlagRequestDocument } from "../schema/index.schema";
import { GetFlagRequestsDTO } from "../dto/index.dto";
import { MongoResultQuery } from "src/shared/mongoResult/MongoResult.query";
import { OperationResult } from "src/shared/mongoResult/OperationResult";
import { RolesGuard } from "src/component/auth/roles.guard";
import { AlreadyExistException, ObjectNotFoundException } from "src/shared/httpError/class/ObjectNotFound.exception";
import { SocialProfileV1Service } from "src/component/social-provider/v1/social-profile-v1.service";

@Injectable()
export class FlagRequestV1Service {
  constructor(
    @InjectModel(FlagRequest.name)
    private flagRequestModel: Model<FlagRequestDocument>,
    @Inject(forwardRef(() => SocialProfileV1Service))
    private socialService: SocialProfileV1Service
  ) { }

  async getAllFlagRequest({ user, status, search, pagination }: GetFlagRequestsDTO) {
    const res = new MongoResultQuery<FlagRequest[]>();
    // Check if the user has the 'admin' role using RolesGuard
    const isAdmin = new RolesGuard(null).matchRoles(['admin'], user.type);

    const skip = pagination.currentPage * pagination.limit;
    const query = {
      ...(isAdmin ? {} : { user: { $elemMatch: { $eq: user } } }),
      status: { $elemMatch: { $eq: status } }
    };

    const flagRequests = await this.flagRequestModel.find(query)
      .populate('user')
      .exec();

    res.data = flagRequests
      .filter((flagRequest) => new RegExp(search, 'i').test(flagRequest.profile.username))
      .slice(skip, skip + pagination.limit) as FlagRequest[];

    res.status = OperationResult.fetch

    return res
  }

  async create({ profileId, user }: { user: any, profileId: string }) {
    const res = new MongoResultQuery<FlagRequest>();

    try {
      const existing = await this.flagRequestModel.findOne({
        user: user.userId,
        profile: profileId
      }).exec()

      const p = await this.socialService.flagProfile(profileId, 'pending')
      if (existing) {
        res.status = OperationResult.create
        res.data = existing;
      }

      const flagRequest = await this.flagRequestModel.create({
        user: user.userId, profile: profileId, status: 'pending'
      })

      if (flagRequest) {
        res.status = OperationResult.create
        res.data = flagRequest
      }

      return res
    } catch (error) {
      console.log(error)
    }
  }

  async updateRequest(profileId: string, status: 'approved' | 'rejected'): Promise<MongoResultQuery<FlagRequest>> {
    const res = new MongoResultQuery<FlagRequest>();

    if (!profileId) {
      this.throwObjectNotFoundError();
    }

    try {
      await this.socialService.flagProfile(profileId, status)
      await this.flagRequestModel.updateMany({ profileId }, { $set: { status } }).exec();

      res.status = OperationResult.update;

      return res;
    } catch (error) {
      console.log(error)
      this.throwObjectNotFoundError();
    }
  }

  async findCurrentUserRequests(userId: string) {
    try {
      return await this.flagRequestModel.find({ user: userId })
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async findRequestsByProfile(profileId: string) {
    try {
      return await this.flagRequestModel.find({ profile: profileId, status: 'pending' })
        .select('-profile')
        .exec()
    } catch (error) {
      console.log(error)
      return []
    }
  }

  private throwObjectNotFoundError(): void {
    throw new ObjectNotFoundException(FlagRequest.name);
  }
}
