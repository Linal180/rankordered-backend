import { AuthGuard } from '@nestjs/passport';

export class GoogleLoginAuthGuard extends AuthGuard('google-login') { }
