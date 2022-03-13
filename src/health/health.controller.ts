import { Controller, Get } from '@nestjs/common';
import {
    HealthCheckService,
    HttpHealthIndicator,
    HealthCheck,
    MongooseHealthIndicator
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private configService: ConfigService,
        private mongoose: MongooseHealthIndicator
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () =>
                this.http.pingCheck(
                    'site',
                    `${this.configService.get('url')}:${this.configService.get(
                        'port'
                    )}`
                ),
            () => this.mongoose.pingCheck('mongo')
        ]);
    }
}
