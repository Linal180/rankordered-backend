import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
      return true;
    } catch (e) {
      // If token is missing or invalid, ignore and proceed without throwing an exception
      return true;
    }
  }

  handleRequest(err: any, user: any) {
    // If there was an error, or user is not defined, do nothing
    if (err || !user) {
      return null;
    }
    return user;
  }
}
