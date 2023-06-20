import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { UserModule } from '../user/user.module';
import { AuthController } from './v1/auth.controller';
import { AdminStrategy } from './admin.strategy';
import { ProfileModule } from '../profile/profile.module';
import { TwitterStrategy } from './twitter.strategy';
import { GoogleStrategy } from './google.strategy';
import { TiktokStrategy } from './tiktok.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { SnapchatStrategy } from './snapchat.strategy';
import { PinterestStrategy } from './pinterest.strategy';

@Module({
    imports: [
        ConfigModule,
        UserModule,
        ProfileModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('jwt.secret'),
                signOptions: { expiresIn: '60m' }
            }),
            inject: [ConfigService]
        })
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        AdminStrategy,
        TwitterStrategy,
        GoogleStrategy,
        TiktokStrategy,
        FacebookStrategy,
        SnapchatStrategy,
        PinterestStrategy
    ],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule {}
