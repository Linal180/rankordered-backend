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
        return {
            uri: process.env.MONGO_USERNAME
                ? `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`
                : `mongodb://${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`,
            connectionFactory: (connection: Connection) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                connection.plugin(require('mongoose-autopopulate'));
                return connection;
            }
        };
    }
}
