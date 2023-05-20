import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocialProfile, SocialProfileDocument } from '../schemas/SocialProfile.schema';
import { CreateSocialProfileDTO } from '../dto/CreateSocialProfile.dto';
import { ObjectNotFoundException } from 'src/shared/httpError/class/ObjectNotFound.exception';

@Injectable()
export class SocialProfileV1Service {
	constructor(
		@InjectModel(SocialProfile.name) private socialModel: Model<SocialProfileDocument>,
	) { }

	async getUserSocialProfiles(userId: string): Promise<SocialProfile[]> {
		return await this.socialModel
			.find({
				userId: userId
			})
			.sort({ createdAt: -1 })
			.exec();
	}

	async getUserPrimaryProfile(userId: string): Promise<SocialProfile> {
		const primary = await this.socialModel
			.findOne({
				userId: userId, primary: true
			})
			.sort({ createdAt: -1 })
			.exec();


		return !!primary ? primary : await this.socialModel
			.findOne({
				userId: userId
			})
			.sort({ createdAt: -1 })
			.exec();
	}

	async create(data: CreateSocialProfileDTO): Promise<SocialProfile> {
		const { provider, email, userId } = data
		const userProfiles = await this.getUserSocialProfiles(userId);
		const existed = userProfiles.filter(profile => profile.email === email && profile.provider === provider)

		if (existed.length)
			return existed[0];

		const newProfile = await this.socialModel.create({ ...data, primary: !!userProfiles.length });

		if (!newProfile) {
			this.throwObjectNotFoundError();
		}

		return newProfile;
	}

	private throwObjectNotFoundError(): void {
		throw new ObjectNotFoundException(SocialProfile.name);
	}
}
