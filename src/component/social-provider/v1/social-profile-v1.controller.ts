import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SocialProfileV1Service } from './social-profile-v1.service';


@ApiTags('SocilaProfile')
@Controller({ path: 'social-profile', version: '1' })
export class SocialProfileV1Controller {
	constructor(private socialService: SocialProfileV1Service) { }

	@Get(':userId')
	@ApiQuery({
		name: 'userId',
		required: true,
		type: String
	})
	getUserSocialProfiles(
		@Param('userId') userId: string,
	) {
		return this.socialService.getUserSocialProfiles(userId);
	}
}
