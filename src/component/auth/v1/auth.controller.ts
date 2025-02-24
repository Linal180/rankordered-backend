import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
    UnauthorizedException,
    Req,
    Res
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
    LoginRequestDto,
    LoginResponseDto,
    RefreshRequestDto,
    SignupRequestDto,
    SsoLoginRequestDto
} from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { LocalAuthGuard } from '../local/local-auth.guard';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { CurrentUserDto } from 'src/component/user/dto/User.dto';
import { TwitterAuthGuard } from '../twitter/twitter-auth.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from '../google/google-auth.guard';
import { TiktokAuthGuard } from '../tiktok/tiktok-auth.guard';
import { InstagramAuthGuard } from '../instagram/instagram.guard';
import { PinterestAuthGuard } from '../pinterest/pinterest-auth.guard';
import { SnapchatAuthGuard } from '../snapchat/snapchat.guard';
import { GoogleLoginAuthGuard } from '../google/google-login-auth.guard';
import { TwitterLoginAuthGuard } from '../twitter/twitter-login-auth.guard';
import {
    ForgotPasswordPayload,
    ResetPasswordPayload,
    ResetPasswordResponse
} from '../dto/ResetPassword.dto';

@ApiTags('Auth')
@Controller({
    version: '1',
    path: 'auth'
})
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Req() request: any): Promise<CurrentUserDto> {
        const { user } = request;
        const currentUser = await this.authService.getCurrentUser(user.userId);

        return currentUser;
    }

    @Post('sso/login')
    @ApiOperation({ summary: 'Login User with SSO' })
    @UseGuards(LocalAuthGuard)
    async ssoLogin(
        @Body() _loginData: SsoLoginRequestDto,
        @Request() req
    ): Promise<any> {
        const { accessToken, sso, accessSecret } = _loginData;
        const response = await this.authService.feedSsoUser(
            sso,
            accessToken,
            accessSecret
        );
        return response;
    }

    @Post('login')
    @ApiOperation({ summary: 'Login User' })
    @UseGuards(LocalAuthGuard)
    async login(
        @Body() _loginData: LoginRequestDto,
        @Request() req
    ): Promise<LoginResponseDto> {
        const tokens = await this.authService.login(req.user);

        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            login_user: req.user
        };
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot Password' })
    async forgotPassword(
        @Body() { email }: ForgotPasswordPayload
    ): Promise<ResetPasswordResponse> {
        return await this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset Password' })
    async resetPassword(
        @Body() payload: ResetPasswordPayload
    ): Promise<ResetPasswordResponse> {
        return await this.authService.resetPassword(payload);
    }

    @Post('signup')
    @ApiOperation({ summary: 'Sign up User' })
    async signup(@Body() payload: SignupRequestDto): Promise<LoginResponseDto> {
        const { access_token, refresh_token, user } =
            await this.authService.signup(payload);

        return { access_token, refresh_token, login_user: user };
    }

    @Post('admin/login')
    @ApiOperation({ summary: 'Login Admin' })
    @UseGuards(AdminAuthGuard)
    async loginAdmin(
        @Body() _loginData: LoginRequestDto,
        @Request() req
    ): Promise<LoginResponseDto> {
        const tokens = await this.authService.login(req.user);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            login_user: req.user
        };
    }

    @Post('token/refresh')
    @ApiOperation({ summary: 'Get new token by refresh token' })
    async refreshToken(@Body() body: RefreshRequestDto) {
        const verify = await this.authService.verifyRefreshToken(
            body.refresh_token
        );

        if (verify) {
            const payload = await this.authService.getPayload(
                body.refresh_token
            );

            const user = await this.authService.getByUsername(payload.username);

            if (!user) {
                throw new UnauthorizedException();
            }

            const login = this.authService.login(user);

            return login;
        }

        throw new UnauthorizedException();
    }

    @Get('logout')
    @UseGuards(JwtAuthGuard)
    async logout() {
        return true;
    }

    @Get('twitter')
    @UseGuards(TwitterAuthGuard)
    twitterAuth() {
        return true;
    }

    @Get('twitter/callback')
    @UseGuards(TwitterAuthGuard)
    async twitterCallback(
        @Req()
        req: Request & {
            user: { accessToken: string; accessSecret: string; sso: string };
        },
        @Res() res: Response
    ) {
        const { accessSecret, accessToken, sso } = req?.user || {};
        const response = await this.authService.feedTwitterUser(
            accessToken,
            accessSecret
        );

        res.redirect(response);
    }

    @Get('twitter-login')
    @UseGuards(TwitterLoginAuthGuard)
    twitterLoginAuth() {
        return true;
    }

    @Get('twitter-login/callback')
    @UseGuards(TwitterLoginAuthGuard)
    async twitterLoginCallback(
        @Req()
        req: Request & {
            user: { accessToken: string; accessSecret: string; sso: string };
        },
        @Res() res: Response
    ) {
        const { accessSecret, accessToken, sso } = req?.user || {};
        const response = await this.authService.feedTwitterUser(
            accessToken,
            accessSecret
        );

        res.redirect(response);
    }

    @Get('google-login')
    @UseGuards(GoogleLoginAuthGuard)
    googleLoginAuth() {
        return true;
    }

    @Get('google-login/callback')
    @UseGuards(GoogleLoginAuthGuard)
    async googleLoginCallback(
        @Req()
        req: Request & {
            user: { accessToken: string; accessSecret: string; sso: string };
        },
        @Res() res: Response
    ) {
        const { accessSecret, accessToken, sso } = req?.user || {};
        const tokens = await this.authService.ssoLogin(
            sso,
            accessToken,
            accessSecret
        );

        // Redirect the user
        res.redirect(
            `${this.configService.get('CLIENT_SSO_SUCCESS_URL')}?accessToken=${tokens ? tokens?.access_token : undefined
            }&refreshToken=${tokens ? tokens.refresh_token : undefined
            }&sso=${sso}&isLogin=true`
        );
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleAuth() {
        return true;
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleCallback(
        @Req()
        req: Request & {
            user: { accessToken: string; accessSecret: string; sso: string };
        },
        @Res() res: Response
    ) {
        const { accessSecret, accessToken, sso } = req?.user || {};
        const response = await this.authService.feedSsoUser(
            sso,
            accessToken,
            accessSecret
        );

        // Redirect the user
        res.redirect(
            `${this.configService.get('CLIENT_SSO_SUCCESS_URL')}?accessToken=${response.access_token
            }&refreshToken=${response.refresh_token}&sso=${sso}`
        );
    }

    @Get('tiktok')
    @UseGuards(TiktokAuthGuard)
    tiktokAuth() {
        console.log('Login with Tiktok');
        return true;
    }
    @Get('tiktok/callback')
    @UseGuards(TiktokAuthGuard)
    async tiktokCallback(
        @Req()
        req: Request & {
            user: { accessToken: string; accessSecret: string; sso: string };
        },
        @Res() res: Response
    ) {
        const { accessToken } = req?.user || {};
        const response = await this.authService.feedTiktokUser(accessToken);

        res.redirect(response);
    }

    @Get('instagram')
    @UseGuards(InstagramAuthGuard)
    instagramAuth() {
        return true;
    }

    @Get('instagram/callback')
    async facebookCallback(
        @Req()
        req: Request,
        @Res() res: Response
    ) {
        const code = req.url.split('?code=')[1] || '';
        console.log(`***** Instagram code ***** ${code}`)
        if (code) {
            const response = await this.authService.feedInstagramUser(code)

            if (response === '404'){
                console.log("****** User not found from cache ********")
                return
            }

            if(response){
                res.redirect(response)
                return
            }

        } else {
            console.log("****** Instagram code not found ********")
        }

        res.redirect(this.configService.get('CLIENT_SSO_SUCCESS_URL'))
    }

    @Get('pinterest')
    @UseGuards(JwtAuthGuard, PinterestAuthGuard)
    pinterestAuth() {
        return true;
    }

    @Get('pinterest/callback')
    async pinterestCallback(
        @Req()
        req: Request,
        @Res() res: Response
    ) {
        const code = req.url.split('code=')[1] || '';

        if (code) {
            const response = await this.authService.feedPinterestUser(code)
            res.redirect(response)
        } else {
            res.redirect(`${this.configService.get('CLIENT_SSO_SUCCESS_URL')}`);
        }
    }

    @Get('snapchat')
    @UseGuards(SnapchatAuthGuard)
    snapchatAuth() {
        return true;
    }

    @Get('snapchat/callback')
    @UseGuards(SnapchatAuthGuard)
    async snapchatCallback(
        @Req()
        req: Request & {
            user: { accessToken: string; accessSecret: string; sso: string };
        },
        @Res() res: Response
    ) {
        const { accessSecret, accessToken, sso } = req?.user || {};
        const response = await this.authService.feedSsoUser(
            sso,
            accessToken,
            accessSecret
        );

        // Redirect the user
        res.redirect(
            `${this.configService.get('CLIENT_SSO_SUCCESS_URL')}?accessToken=${response.access_token
            }&refreshToken=${response.refresh_token}&sso=${sso}`
        );
    }
}
