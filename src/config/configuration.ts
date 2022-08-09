import { join } from 'path';

export default () => ({
    url: process.env.URL,
    port: parseInt(process.env.PORT, 10) || 4000,
    rootPath: join(__dirname, '../../'),
    database: {
        name: process.env.DATABASE_NAME
    },
    jwt: {
        secret: process.env.JWT_SECRET
    }
});
