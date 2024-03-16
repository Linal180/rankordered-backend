import { AuthGuard } from '@nestjs/passport';

export class SnapchatAuthGuard extends AuthGuard('snapchat') {}