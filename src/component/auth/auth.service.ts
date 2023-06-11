import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from '../user/schemas/user.schema';
import { Userv1Service } from '../user/v1/userv1.service';
import { getGoogleUserInfo, getTwitterUserInfo } from 'src/utils/social-media-helpers/social-media.utils';
import { UserType } from '../user/dto/UserType';
import { OperationResult } from 'src/shared/mongoResult/OperationResult';
import { SocialProfileV1Service } from '../social-provider/v1/social-profile-v1.service';
import { CurrentUserDto } from '../user/dto/User.dto';
import { SocialProfile } from '../social-provider/schemas/SocialProfile.schema';

@Injectable()
export class AuthService {
    constructor(
        private userService: Userv1Service,
        private jwtService: JwtService,
        private profileService: SocialProfileV1Service
    ) { }

    async validateUser(
        username: string,
        password: string
    ): Promise<User | null> {
        const user = await this.userService.getByUsername(username);
        if (user && (await compare(password, user.password))) {
            user.password = undefined;
            return user;
        }
        return null;
    }

    async getCurrentUser(userId: string): Promise<CurrentUserDto | null> {
        try {
            const user = (await this.userService.findById(userId)).data;
            const profile = await this.profileService.getUserPrimaryProfile(userId)

            if (user) {
                return this.setCurrentUserPayload(user, profile ?? null);
            } else return null
        } catch (error) {
            throw error;
        }
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user._id,
            type: user.type
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, {
                expiresIn: '1440m'
            })
        };
    }

    async verifyRefreshToken(refreshToken: string): Promise<boolean> {
        try {
            const h = await this.jwtService.verifyAsync(refreshToken);
            const expiry_date = new Date(h.exp * 1000);
            if (expiry_date < new Date()) {
                return false;
            }
            return true;
        } catch (err) {
            return false;
        }
    }

    async getByUsername(username: string): Promise<User> {
        return this.userService.getByUsername(username);
    }

    async getPayload(token: string): Promise<any> {
        return this.jwtService.decode(token);
    }

    async feedSsoUser(sso: string, accessToken: string, accessSecret = '') {
        try {
            let ssoUser;

            switch (sso) {
                case 'youtube':
                case 'google':
                    const googleUser = await getGoogleUserInfo(accessToken);
                    ssoUser = {
                        email: googleUser.email,
                        name: googleUser.name,
                        picture: googleUser.picture
                    }
                    break;

                case 'twitter':
                    const twitterUser: any = await getTwitterUserInfo(accessToken, accessSecret)
                    ssoUser = {
                        email: twitterUser.email,
                        name: twitterUser?.name,
                        picture: twitterUser.profile_image_url
                    }
                    break;

            }

            const { email, name, picture } = ssoUser
            const user: any = await this.userService.getByEmail(email);
            let userPayload;

            if (!user) {
                const { data, status } = await this.userService.createUser({
                    email, name, password: 'user@123', username: name, type: 'user' as UserType, provider: sso, profilePicture: picture
                });

                if (status === OperationResult.create) {
                    userPayload = data;
                }
            } else {
                const profile = await this.profileService.findSocialProfileByIdAndProvider(user?._id, sso)

                if (!profile) {
                    await this.profileService.create({ email, provider: sso === 'google' ? 'youtube' : sso, profilePicture: picture, userId: user?._id.toString() })
                }

                userPayload = user;
            }

            const { access_token, refresh_token } = await this.login(userPayload);

            return {
                access_token, refresh_token
            }
        } catch (error) {
            console.log(error)
        }
    }

    setCurrentUserPayload(user: User, profile: SocialProfile | null): CurrentUserDto {
        const { email, name, username } = user;
        const { email: primaryEmail, profilePicture, provider } = profile || {};

        return {
            email, name, username,
            ...(profile && {
                primaryProfile: {
                    email: primaryEmail, profilePicture, provider
                }
            })
        }
    }
}
