import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-instagram';

@Injectable()
export class InstagramStrategy extends PassportStrategy(Strategy, 'instagram') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get('INSTAGRAM_CLIENT_ID') || '',
            clientSecret: configService.get('INSTAGRAM_CLIENT_SECRET') || '',
            callbackURL: configService.get('INSTAGRAM_CALLBACK_URL') || '',
            scope: ['basic']
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
