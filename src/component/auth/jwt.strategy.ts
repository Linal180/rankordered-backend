import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cache from 'memory-cache';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: (req: any) => {
                let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

                if (!token) {
                    token = ExtractJwt.fromUrlQueryParameter('token')(req);
                }

                return token;
            },
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret')
        });
    }
    async validate(payload: any) {
        cache.put('userId', payload.sub, 20000)
        return {
            userId: payload.sub,
            username: payload.username,
            type: payload.type
        };
    }
}
