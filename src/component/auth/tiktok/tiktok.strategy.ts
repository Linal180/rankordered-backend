import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-tiktok-auth';
import { AuthService } from '../auth.service';

@Injectable()
export class TiktokStrategy extends PassportStrategy(Strategy, 'tiktok') {
	constructor(
		configService: ConfigService,
		private readonly authService: AuthService
	) {
		super({
			clientID: configService.get('TIKTOK_CLIENT_ID'),
			clientSecret: configService.get('TIKTOK_CLIENT_SECRET'),
			scope: ['user.info.basic'],
			callbackURL: configService.get('TIKTOK_CALLBACK_URL')
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: any,
		done: any
	) {
		try {
			done(null, {
				accessToken,
				accessSecret: refreshToken,
				sso: profile.provider
			});
		} catch (err) {
			done(err, false);
		}
	}
}
