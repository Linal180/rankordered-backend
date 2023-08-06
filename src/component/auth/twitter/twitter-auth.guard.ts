import { AuthGuard } from '@nestjs/passport';

export class TwitterAuthGuard extends AuthGuard('twitter') {}
