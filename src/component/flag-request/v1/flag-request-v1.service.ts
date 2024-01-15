import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FlagRequest, FlagRequestDocument } from "../schema/index.schema";
import { GetFlagRequestsDTO } from "../dto/index.dto";
import { MongoResultQuery } from "src/shared/mongoResult/MongoResult.query";
import { OperationResult } from "src/shared/mongoResult/OperationResult";
import { RolesGuard } from "src/component/auth/roles.guard";
import { ObjectNotFoundException } from "src/shared/httpError/class/ObjectNotFound.exception";
import { SocialProfileV1Service } from "src/component/social-provider/v1/social-profile-v1.service";

@Injectable()
export class FlagRequestV1Service {
  constructor(
    @InjectModel(FlagRequest.name)
    private flagRequestModel: Model<FlagRequestDocument>,
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
      const flagRequests = await this.flagRequestModel.create({ user: user._id, profile: profileId })

      if (flagRequests) {
        res.status = OperationResult.create
        res.data = flagRequests
      }

      return res
    } catch (error) {
      console.log(error)
    }
  }

  async update({ profileId, status }: { status: 'approved' | 'rejected', profileId: string }) {
    const res = new MongoResultQuery();

    try {
      if (profileId) {
        const profile = await this.socialService.flaggedProfile(profileId, status === 'approved')

        if (profile) {
          const flagRequests = await this.flagRequestModel.find({
            profile: profileId
          }).exec()

          for (const request of flagRequests) {
            if (request) {
              request.status = status
              await request.save()
            }
          }

          res.status = OperationResult.update
          return res
        }
      }

      this.throwObjectNotFoundError()
    } catch (error) {
      console.log(error)
      this.throwObjectNotFoundError()
    }
  }

  async delete(id: string): Promise<MongoResultQuery<FlagRequest>> {
    const res = new MongoResultQuery<FlagRequest>();

    if (!id) {
      this.throwObjectNotFoundError();
    }

    try {
      await this.flagRequestModel.findByIdAndDelete(id).exec();

      res.status = OperationResult.delete;

      return res;
    } catch (error) {
      console.log(error)
      this.throwObjectNotFoundError();
    }
  }

  private throwObjectNotFoundError(): void {
    throw new ObjectNotFoundException(FlagRequest.name);
  }
}
