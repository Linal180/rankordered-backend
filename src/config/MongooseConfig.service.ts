import { Injectable } from '@nestjs/common';
import {
    MongooseModuleOptions,
    MongooseOptionsFactory
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseConfigSerive implements MongooseOptionsFactory {
    createMongooseOptions():
        | MongooseModuleOptions
        | Promise<MongooseModuleOptions> {
        const option: MongooseModuleOptions = {
            uri: `mongodb://${process.env.DATABASE_URL}`,
            dbName: process.env.DATABASE_NAME,
            connectionFactory: (connection: Connection) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                connection.plugin(require('mongoose-autopopulate'));
                return connection;
            }
        };

        if (process.env.MONGO_USERNAME) {
            option.auth = {
                username: process.env.MONGO_USERNAME,
                password: process.env.MONGO_PASSWORD
            };
        }

        return option;
    }
}
