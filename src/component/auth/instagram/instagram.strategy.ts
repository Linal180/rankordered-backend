import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import { Strategy } from 'passport-instagram';

@Injectable()
export class InstagramStrategy extends PassportStrategy(Strategy, 'instagram') {
    readonly configService: ConfigService
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get('INSTAGRAM_CLIENT_ID'),
            clientSecret: configService.get('INSTAGRAM_CLIENT_SECRET'),
            callbackURL: configService.get('INSTAGRAM_CALLBACK_URL'),
            // scope: [' 'user_media']
        });
    }

    async validate(
        code: string,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
    ) {
        try {
            const tokenEndpoint = 'https://api.instagram.com/oauth/access_token';

            const tokenResponse = await axios.post(tokenEndpoint, {
                client_id: this.configService.get('INSTAGRAM_CLIENT_ID'),
                client_secret: this.configService.get('INSTAGRAM_CLIENT_SECRET'),
                grant_type: 'authorization_code',
                redirect_uri: this.configService.get('INSTAGRAM_CALLBACK_URL'),
                code: code,
            });

            console.log(":::::::::::::::", tokenResponse)
            done(null, {
                accessToken: '',
                accessSecret: '',
                sso: profile.provider
            });
        } catch (err) {
            done(err, false);
        }
    }
}
