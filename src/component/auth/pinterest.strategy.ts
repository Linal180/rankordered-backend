import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-pinterest';

@Injectable()
export class PinterestStrategy extends PassportStrategy(Strategy, 'pinterest') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get('PINTEREST_CLIENT_ID'),
            clientSecret: configService.get('PINTEREST_CLIENT_SECRET'),
            callbackURL: configService.get('PINTEREST_CALLBACK_URL')
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
