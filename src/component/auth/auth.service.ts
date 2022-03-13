import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from '../user/schemas/user.schema';
import { Userv1Service } from '../user/v1/userv1.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: Userv1Service,
        private jwtService: JwtService
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.getByUsername(username);
        if (user && (await compare(password, user.password))) {
            user.password = undefined;
            return user;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id };
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
}
