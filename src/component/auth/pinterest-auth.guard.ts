import { AuthGuard } from '@nestjs/passport';

export class PinterestAuthGuard extends AuthGuard('pintrest') {}
