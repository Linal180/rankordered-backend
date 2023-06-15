import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { AuthService } from './auth.service';
// import { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } from './config';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            consumerKey: configService.get('TWITTER_CONSUMER_KEY'),
            consumerSecret: configService.get('TWITTER_CONSUMER_SECRET'),
            callbackURL: configService.get('TWITTER_CALLBACK_URL')
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
