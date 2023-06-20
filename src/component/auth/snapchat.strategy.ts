import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-snapchat';

@Injectable()
export class SnapchatStrategy extends PassportStrategy(Strategy, 'snapchat') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get('SNAPCHAT_CLIENT_ID'),
            clientSecret: configService.get('SNAPCHAT_CLIENT_SECRET'),
            callbackURL: configService.get('SNAPCHAT_CALLBACK_URL')
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
