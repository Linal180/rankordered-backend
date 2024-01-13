import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-instagram';

@Injectable()
export class InstagramStrategy extends PassportStrategy(Strategy, 'instagram') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get('INSTAGRAM_CLIENT_ID'),
            callbackURL: configService.get('INSTAGRAM_CALLBACK_URL'),
            scope: 'user_profile,user_media'
        });
    }

    async validate(
        code: string,
        profile: any,
        done: any
    ) {
        try {
            done(null, {
                code,
            });
        } catch (err) {
            done(err, false);
        }
    }
}