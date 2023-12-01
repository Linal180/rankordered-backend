import { AuthGuard } from '@nestjs/passport';

export class InstagramAuthGuard extends AuthGuard('instagram') {}
