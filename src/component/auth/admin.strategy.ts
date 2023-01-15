import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { UserType } from '../user/dto/UserType';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
    static key = 'admin';

    constructor(private authService: AuthService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(username, password);
        if (!user || user.type !== UserType.ADMIN) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
