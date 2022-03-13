import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CollegeMigrationRunner } from './CollegeMigration/CollegeMigration.command';

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379
            },
            prefix: 'rankorder'
        }),
        BullModule.registerQueue({ name: 'college_migration' }),
        HttpModule
    ],
    providers: [CollegeMigrationRunner]
})
export class MigrationModule {}
