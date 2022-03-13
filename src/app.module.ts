import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseConfigSerive } from './config/MongooseConfig.service';
import { ComponentModule } from './component/component.module';
import { UtilModule } from './utils/util.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HttpExceptionFilter } from './shared/httpError/filter/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { GalleryModule } from './component/gallery/gallery.module';
@Module({
    imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../../', 'public'),
            serveRoot: '/public'
        }),
        MongooseModule.forRootAsync({
            useClass: MongooseConfigSerive
        }),
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379
            },
            prefix: 'rankorder'
        }),
        MulterModule.register({ dest: './public/upload' }),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        HttpModule,
        HealthModule,
        ComponentModule,
        UtilModule,
        GalleryModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter
        }
    ]
})
export class AppModule {}
