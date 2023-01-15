import { Module } from '@nestjs/common';
import { ProfileV1Controller } from './v1/profile-v1.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule],
    controllers: [ProfileV1Controller]
})
export class ProfileModule {}
