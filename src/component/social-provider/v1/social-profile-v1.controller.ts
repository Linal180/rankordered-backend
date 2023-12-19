import { BadRequestException, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SocialProfileV1Service } from './social-profile-v1.service';
import { JwtAuthGuard } from 'src/component/auth/jwt-auth.guard';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { SocialProfile } from '../schemas/SocialProfile.schema';

@ApiTags('SocialProfile')
@Controller({ path: 'social-profiles', version: '1' })
export class SocialProfileV1Controller {
	constructor(private socialService: SocialProfileV1Service) { }

	@Get('/')
	@UseGuards(JwtAuthGuard)
	async getUserSocialProfiles(@Req() request: any) {
		const { user } = request || {};

		if (user && user.userId) {
			return this.socialService.getUserSocialProfiles(user.userId);
		} else {
			throw new BadRequestException();
		}
	}

	@Get('favorite-profiles')
	@UseGuards(JwtAuthGuard)
	async getFavoriteSocialProfiles(@Req() request: any) {
		const { user } = request || {};

		if (user && user.userId) {
			return this.socialService.getUserSocialProfiles(user.userId, true);
		} else {
			throw new BadRequestException();
		}
	}

	@Put(':id')
	@UseGuards(JwtAuthGuard)
	updateSocialProfile(
		@Req() request: any,
		@Param('id') id: string,
	): Promise<MongoResultQuery<SocialProfile>> {
		const { user } = request || {};

		if (id && user && user.userId) {
			return this.socialService.updateAsFavorite(id);
		} else {
			throw new BadRequestException();
		}
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	deleteSocialProfile(
		@Req() request: any,
		@Param('id') id: string,
	): Promise<MongoResultQuery<SocialProfile>> {
		const { user } = request || {};

		if (id && user && user.userId) {
			return this.socialService.delete(id);
		} else {
			throw new BadRequestException();
		}
	}
}
