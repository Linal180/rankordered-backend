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
    },
    epNextAppBaseURL: process.env.NEXT_APP_BASE_URL,
    sendGridApiKey: process.env.SEND_GRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
    templateId: process.env.SEND_GRID_RESET_EMAIL_TEMPLATE_ID,
});
