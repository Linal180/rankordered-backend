import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-instagram';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get('FACEBOOK_CLIENT_ID'),
            clientSecret: configService.get('FACEBOOK_CLIENT_SECRET'),
            callbackURL: configService.get('FACEBOOK_CALLBACK_URL')
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
