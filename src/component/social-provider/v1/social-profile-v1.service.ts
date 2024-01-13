import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocialProfile, SocialProfileDocument } from '../schemas/SocialProfile.schema';
import { CreateSocialProfileDTO } from '../dto/CreateSocialProfile.dto';
import { ObjectNotFoundException } from 'src/shared/httpError/class/ObjectNotFound.exception';
import { Userv1Service } from 'src/component/user/v1/userv1.service';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { OperationResult } from 'src/shared/mongoResult/OperationResult';
import { CategoryV1Service } from 'src/component/category/v1/category-v1.service';
import { ComparisonItemV1Service } from '../../comparisonItem/v1/comparison-item-v1.service';
import { CreateComparisonItemDto } from 'src/component/comparisonItem/dto/CreateComparisonItem.dto';

@Injectable()
export class SocialProfileV1Service {
	constructor(
		@InjectModel(SocialProfile.name)
		private socialModel: Model<SocialProfileDocument>,
		@Inject(forwardRef(() => CategoryV1Service))
		private categoryService: CategoryV1Service,
		@Inject(forwardRef(() => Userv1Service))
		private userService: Userv1Service,
		@Inject(forwardRef(() => ComparisonItemV1Service))
		private itemService: ComparisonItemV1Service,
	) { }

	async getUserSocialProfiles(userId: string, favoriteOnly = false): Promise<SocialProfile[]> {
		try {
			if (!userId)
				throw new BadRequestException();

			const user = this.userService.findById(userId)

			if (user) {
				const socialProfiles = await this.socialModel
					.find({
						userId: userId,
						...(favoriteOnly && { isFavorite: true })
					})
					.sort({ createdAt: -1 })
					.populate({
						path: 'category',
						model: 'Category',
						select: 'name _id' // Include only 'name' and '_id' fields
					})
					.exec();

				const populatedSocialProfiles = await this.populateComparisonItem(socialProfiles);

				return populatedSocialProfiles;
			} else
				throw new NotFoundException();
		} catch (error) {
			throw error;
		}
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

	async findSocialProfileByIdAndProvider(userId: string, provider: string): Promise<SocialProfile> {
		return await this.socialModel
			.findOne({
				userId, provider
			})
			.sort({ createdAt: -1 })
			.exec();
	}

	async findUserSocialProfilesCount(userId: string): Promise<number> {
		const profiles = await this.socialModel
			.find({ userId })
			.sort({ createdAt: -1 })
			.exec();

		return profiles.length || 0;
	}

	async create(data: CreateSocialProfileDTO): Promise<SocialProfile> {
		const { provider, email, userId, profilePicture, username } = data
		const userProfiles = await this.getUserSocialProfiles(userId);
		const existed = userProfiles.filter(profile => profile.email === email && profile.provider === provider)

		if (!!existed.length)
			return existed[0];

		try {
			const newProfile = await this.socialModel.create({
				provider, email, profilePicture, userId, primary: !userProfiles.length, isFavorite: false,
				username
			});

			if (!newProfile) {
				this.throwObjectNotFoundError();
			}

			return newProfile;

		} catch (error) {
			console.log(error)
		}
	}

	async createProfileComparisonItem(profile: SocialProfile) {
		const category: any = profile.category
		const itemPayload: CreateComparisonItemDto = {
			name: profile.username,
			defaultCategory: category._id.toString(),
			slug: profile.userId,
			profile,
			category: [category._id.toString()]
		}

		const { status } = await this.itemService.createItem(itemPayload)

		return status;
	}

	async setSocialProfileCategory(id: string, categoryId: string): Promise<MongoResultQuery<SocialProfile>> {
		const res = new MongoResultQuery<SocialProfile>();

		if (!id) {
			this.throwObjectNotFoundError();
		}

		const profile = await this.socialModel.findById(id).exec();
		const { data: category } = await this.categoryService.findById(categoryId)

		if (profile && category) {

			profile.category = category;
			res.data = await profile.save();

			await this.createProfileComparisonItem(profile);

			res.status = OperationResult.update;

			return res;
		} else this.throwObjectNotFoundError();
	}

	async updateAsFavorite(id: string): Promise<MongoResultQuery<SocialProfile>> {
		const res = new MongoResultQuery<SocialProfile>();

		if (!id) {
			this.throwObjectNotFoundError();
		}

		const profile = await this.socialModel.findById(id).exec();
		const mark = profile.isFavorite;

		profile.isFavorite = !mark; // Toggle the value of isFavorite

		res.data = await profile.save(); // Save the updated profile

		if (!res.data) {
			this.throwObjectNotFoundError();
		}

		res.status = OperationResult.update;

		return res;
	}

	async delete(id: string): Promise<MongoResultQuery<SocialProfile>> {
		const res = new MongoResultQuery<SocialProfile>();

		if (!id) {
			this.throwObjectNotFoundError();
		}

		await this.socialModel.findByIdAndDelete(id).exec();

		res.status = OperationResult.delete;

		return res;
	}

	private throwObjectNotFoundError(): void {
		throw new ObjectNotFoundException(SocialProfile.name);
	}

	private async populateComparisonItem(socialProfiles: SocialProfile[]): Promise<SocialProfile[]> {
		const populatedSocialProfiles = [];

		for (const socialProfile of socialProfiles) {
			if (socialProfile) {
				const item = await this.itemService.findByProfile((socialProfile as any)._id.toString());

				if (item) {
					const profileWithRanking: SocialProfile & { ranking: number } = {
						...(socialProfile as any).toJSON(),  // Convert Mongoose document to plain JavaScript object
						ranking: item?.ranking,
					};

					populatedSocialProfiles.push(profileWithRanking);
				}
			}
		}

		return populatedSocialProfiles;
	}
}
