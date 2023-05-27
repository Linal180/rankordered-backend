import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
    UnauthorizedException,
    Req
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import {
    LoginRequestDto,
    LoginResponseDto,
    RefreshRequestDto,
    SsoLoginRequestDto
} from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { LocalAuthGuard } from '../local-auth.guard';
import { AdminAuthGuard } from '../admin-auth.guard';
import { CurrentUserDto } from 'src/component/user/dto/User.dto';

@ApiTags('Auth')
@Controller({
    version: '1',
    path: 'auth'
})
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Req() request: any): Promise<CurrentUserDto> {
        const { user } = request;
        const currentUser = await this.authService.getCurrentUser(user.userId);

        return currentUser;
    }

    @Post('sso/login')
    @ApiOperation({ summary: 'Login User with SSO' })
    // @UseGuards(LocalAuthGuard)
    async ssoLogin(
        @Body() _loginData: SsoLoginRequestDto,
        @Request() req
    ): Promise<any> {
        const { accessToken, sso, accessSecret } = _loginData;
        const response = await this.authService.feedSsoUser(sso, accessToken, accessSecret)
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
}
