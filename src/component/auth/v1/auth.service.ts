import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as cache from 'memory-cache';
import { User } from '../../user/schemas/user.schema';
import { Userv1Service } from '../../user/v1/userv1.service';
import { getGoogleUserInfo, getTwitterUserInfo, getTiktokUserInfo, getInstagramAccessToken } from 'src/utils/social-media-helpers/social-media.utils';
import { UserType } from '../../user/dto/UserType';
import { OperationResult } from 'src/shared/mongoResult/OperationResult';
import { SocialProfileV1Service } from '../../social-provider/v1/social-profile-v1.service';
import { CurrentUserDto } from '../../user/dto/User.dto';
import { SocialProfile } from '../../social-provider/schemas/SocialProfile.schema';
import { SignupRequestDto } from '../dto/login.dto';
import { ResetPasswordPayload, ResetPasswordResponse } from '../dto/ResetPassword.dto';
import { MailerService } from 'src/component/mailer/mailer.service';
import { BadRequestException, InvalidTokenException, RecordNotFoundException } from 'src/shared/httpError/class/ObjectNotFound.exception';
import { SsoProvider, SsoUser, TwitterUser } from 'src/interfaces';
import { ConfigService } from '@nestjs/config';
import { getPinterestAccessToken } from '../../../utils/social-media-helpers/social-media.utils';

@Injectable()
export class AuthService {
    constructor(
        private userService: Userv1Service,
        private readonly configService: ConfigService,
        private jwtService: JwtService,
        private profileService: SocialProfileV1Service,
        private mailerService: MailerService
    ) { }

    async validateUser(
        username: string,
        password: string
    ): Promise<User | null> {
        const user = await this.userService.getByUsernameOrEmail(username);
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

    async signup(payload: SignupRequestDto) {
        const { name, password, username: email } = payload;
        const username = this.generateUsername(name);
        const user: any = await this.userService.getByEmail(email);

        if (!user) {
            const { data, status } = await this.userService.createUser({
                email, name, password, username, type: 'user' as UserType,
            });

            if (status === OperationResult.create) {
                const { access_token, refresh_token } = await this.login(data);

                return {
                    access_token, refresh_token, user: data
                }
            }
        } else {
            throw new ConflictException();
        }
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user._id,
            type: user.type
        };

        return this.generateAuthTokens(payload);
    }

    async ssoLogin(sso: string, accessToken: string, accessSecret = '') {
        try {
            let email = "";

            switch (sso) {
                case 'youtube':
                case 'google':
                    const googleUser = await getGoogleUserInfo(accessToken);
                    email = googleUser.email;
                    break;

                case 'twitter':
                    const twitterUser: any = await getTwitterUserInfo(accessToken, accessSecret)
                    email = twitterUser.email;
                    break;

                case 'tiktok':
                    const tiktokUser = await getTiktokUserInfo(accessToken)
                    email = tiktokUser.email;
            }

            if (!email) {
                return {
                    access_token: null,
                    refresh_token: null
                }
            }

            const user: any = await this.userService.getByEmail(email)

            if (user) {
                const payload = {
                    username: user.username,
                    sub: user._id || '',
                    type: user.type
                };

                return this.generateAuthTokens(payload);
            } else {
                return {
                    access_token: null,
                    refresh_token: null
                }
            }

        } catch (error) {
            console.log(error)
        }
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
            let ssoUser: SsoUser;

            switch (sso) {
                case 'youtube':
                case 'google':
                    const { email: googleEmail, given_name, name: googleName, picture } = await getGoogleUserInfo(accessToken);
                    ssoUser = {
                        email: googleEmail,
                        name: googleName,
                        picture: picture,
                        username: given_name,
                    }
                    break;

                case 'tiktok':
                    const tiktokUser = await getTiktokUserInfo(accessToken)
                    ssoUser = { ...tiktokUser };
                    break;
            }

            const { email, name, picture, username } = ssoUser
            const user: any = await this.userService.getByEmail(email);
            let userPayload;

            if (!user) {
                const { data, status } = await this.userService.createUser({
                    email, name, username, type: 'user' as UserType, provider: sso
                });

                if (status === OperationResult.create) {
                    userPayload = data;
                }
            } else {
                const profile = await this.profileService.findSocialProfileByIdAndProvider(user?._id, sso)

                if (!profile) {
                    await this.profileService.create({
                        email, provider: sso === 'google' ? 'youtube' : sso,
                        profilePicture: picture,
                        userId: user?._id.toString(),
                        username: username
                    })
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

    async forgotPassword(email: string): Promise<ResetPasswordResponse> {
        const user: any = await this.userService.getByEmail(email);

        if (!user) {
            throw new RecordNotFoundException();
        }

        const token = this.createToken();
        user.token = token;
        const { status } = await this.userService.updateUser(user?._id, { token })

        if (status) {
            const { statusCode } = await this.mailerService.sendResetPasswordLink({ email, fullName: user.name, token })

            if (statusCode === 202) {
                return {
                    message: "Reset password link sent!",
                    status: 200
                }
            }
        }

        throw new BadRequestException();
    }

    async resetPassword({ token, password }: ResetPasswordPayload): Promise<ResetPasswordResponse> {
        if (token) {
            const user: any = await this.userService.getByResetToken(token);

            if (user) {
                const { status } = await this.userService.updateUser(user?._id, {
                    token: null, password
                });

                if (status) {
                    return {
                        status: 200,
                        message: "Password changed"
                    }
                }
            }
        }

        throw new InvalidTokenException();
    }

    async feedTiktokUser(access: string) {
        try {
            const user = await this.getUserFromCache();

            if (!user) return null;

            const tiktokUser = await getTiktokUserInfo(access)

            if (tiktokUser) {
                const {email, profile_picture, username } = tiktokUser || {}
                const profile = await this.profileService.findSocialProfileByIdAndProvider((user as any)?._id, 'tiktok')

                if (!profile) {
                    await this.profileService.create({
                        email, provider: 'tiktok',
                        profilePicture: profile_picture || '',
                        userId: (user as any)?._id.toString(),
                        username
                    })
                }

                return await this.redirectUrl(user, 'tiktok')
            }
        } catch (error) {
            console.log(error)
        }
    }

    async feedTwitterUser(access: string, secret: string) {
        try {
            const user = await this.getUserFromCache();

            if (!user) return null;

            const {
                email, profile_image_url_https, screen_name
            }: TwitterUser = await getTwitterUserInfo(access, secret)


            if (email) {
                const profile = await this.profileService.findSocialProfileByIdAndProvider((user as any)?._id, 'twitter')

                if (!profile) {
                    await this.profileService.create({
                        email, provider: 'twitter',
                        profilePicture: profile_image_url_https || '',
                        userId: (user as any)?._id.toString(),
                        username: screen_name
                    })
                }

                return await this.redirectUrl(user, 'twitter')
            }
        } catch (error) {
            console.log(error)
        }
    }

    async feedInstagramUser(code: string): Promise<string> {
        try {
            const user = await this.getUserFromCache();

            if (!user) return '404';

            const instagramUser = await getInstagramAccessToken(code);

            if (instagramUser) {
                const { picture, username, email } = instagramUser;
                const profile = await this.profileService.findSocialProfileByIdAndProvider((user as any)?._id, 'instagram')

                if (!profile) {
                    await this.profileService.create({
                        email, provider: 'instagram',
                        profilePicture: picture || '',
                        userId: (user as any)?._id.toString(),
                        username: username
                    })
                }

                return await this.redirectUrl(user, 'instagram')
            }
        } catch (error) {
            console.log(error)
            return this.redirectUrl()
        }
    }

    async feedPinterestUser(code: string): Promise<string> {
        try {
            const user = await this.getUserFromCache();

            if (!user) return null;

            const pinterestUser = await getPinterestAccessToken(code);

            if (pinterestUser) {
                const { username, profile_image } = pinterestUser
                const profile = await this.profileService.findSocialProfileByIdAndProvider((user as any)?._id, 'pinterest')

                if (!profile) {
                    await this.profileService.create({
                        email: user.email, provider: 'pinterest',
                        profilePicture: profile_image || '',
                        userId: (user as any)?._id.toString(),
                        username: username
                    })
                }

                return await this.redirectUrl(user, 'pinterest')
            }
        } catch (error) {
            console.log(error)
            return this.redirectUrl()
        }
    }

    setCurrentUserPayload(user: User, profile: SocialProfile): CurrentUserDto {
        const { email, name, username, profilePicture: primary } = user || {};
        const { email: primaryEmail, profilePicture, provider } = profile || {};

        const nextAppHost = this.configService.get<string>('url')
        const _id = (user as any)._id
        const currentUser: CurrentUserDto = {
            _id, email, name, username,
            ...(profile && {
                primaryProfile: {
                    email: primaryEmail, profilePicture, provider
                }
            })
        }

        if (primary) {
            currentUser.profilePicture = `${nextAppHost}/${primary.path}/${primary.slug}`
        }

        return currentUser;
    }

    private generateUsername(name: string) {
        return (name || "").toLowerCase().split(' ').join('-');
    }

    private generateAuthTokens(payload: { username: string; sub: string, type: string }) {
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '365d' }),
            refresh_token: this.jwtService.sign(payload, {
                expiresIn: '1440m'
            })
        }
    }

    private async getUserFromCache() {
        const userId = cache.get('userId');

        if (userId) {
            const { data: user } = await this.userService.findById(userId);

            return user;
        }

        return null
    }

    private async redirectUrl(user: User = null, provider: SsoProvider = 'google' ): Promise<string> {
        if(user){
            const { access_token, refresh_token } = await this.login(user);
            
            if (access_token) {
                return `${this.configService.get('CLIENT_SSO_SUCCESS_URL')}?accessToken=${access_token}&refreshToken=${refresh_token}&sso=${provider}`;
            }
        }

        return this.configService.get('CLIENT_SSO_SUCCESS_URL')
    }

    private createToken(): string {
        return uuidv4();
    }
}
