import { AuthGuard } from '@nestjs/passport';

export class TiktokAuthGuard extends AuthGuard('tiktok') { }
