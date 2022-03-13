import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';
// import { ErrorsInterceptor } from './Shared/Response/Interceptors/Errors.interceptor';
import { HttpExceptionFilter } from './shared/httpError/filter/http-exception.filter';

async function bootstrap() {
    // const httpsOptions = {
    //   key: readFileSync('/home/rankordered/stg-rankordered-backend/ssl/b3342_337f9_09b846c1d971681406cf4eebcb25dd32.key'),
    //   cert: readFileSync('/home/rankordered/stg-rankordered-backend/ssl/stgapi_rankordered_com_b3342_337f9_1653301382_8d38ecbf5b9cf77cc0d5c079097b2b94.crt'),
    // };

    // const httpsOptions = {
    //   key: readFileSync('./ssl/kye.pem'),
    //   cert: readFileSync( './ssl/cert.pem'),
    // };

    const app = await NestFactory.create(AppModule, {
        cors: true,
        bodyParser: true,
        logger: ['error', 'warn', 'log']
    });

    app.enableVersioning();

    const configService = app.get(ConfigService);

    const port = configService.get('port');

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    // app.useGlobalInterceptors(new ErrorsInterceptor());

    // Starts listening for shutdown hooks
    app.enableShutdownHooks();

    app.use(
        ['/api/swagger'],
        basicAuth({
            challenge: true,
            users: {
                rankordered: '%2YU#at7tz@s'
            }
        })
    );

    const config = new DocumentBuilder()
        .setTitle('Rankordered Api List')
        .setDescription('Api list of rankordered application')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/swagger', app, document);

    await app.listen(port, () =>
        console.log(`Rankordered app listening to port ` + port)
    );
}

bootstrap();
