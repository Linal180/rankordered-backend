import { CommandFactory } from 'nest-commander';
import { MigrationModule } from './migration/migration.module';

async function bootstrap() {
    await CommandFactory.run(MigrationModule);
}

bootstrap();
