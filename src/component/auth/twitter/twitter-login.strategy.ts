import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';

@Injectable()
export class TwitterLoginStrategy extends PassportStrategy(Strategy, 'twitter-login') {
  constructor(configService: ConfigService) {
    super({
      consumerKey: configService.get('TWITTER_CONSUMER_KEY'),
      consumerSecret: configService.get('TWITTER_CONSUMER_SECRET'),
      callbackURL: configService.get('TWITTER_LOGIN_CALLBACK_URL')
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
