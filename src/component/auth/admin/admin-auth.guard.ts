import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminStrategy } from './admin.strategy';

@Injectable()
export class AdminAuthGuard extends AuthGuard(AdminStrategy.key) {}
