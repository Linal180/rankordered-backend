import { AuthGuard } from '@nestjs/passport';

export class TwitterLoginAuthGuard extends AuthGuard('twitter-login') { }
