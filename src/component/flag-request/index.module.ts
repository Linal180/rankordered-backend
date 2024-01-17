import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlagRequest, FlagRequestSchema } from './schema/index.schema';
import { FlagRequestV1Service } from './v1/flag-request-v1.service';
import { FlagRequestV1Controller } from './v1/flag-request-v1.controller';
import { SocialProfileModule } from '../social-provider/SocialProfile.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlagRequest.name, schema: FlagRequestSchema }
    ]),
    forwardRef(() => SocialProfileModule)
  ],
  providers: [FlagRequestV1Service],
  controllers: [FlagRequestV1Controller],
  exports: [FlagRequestV1Service]
})

export class FlagRequestModule { }
