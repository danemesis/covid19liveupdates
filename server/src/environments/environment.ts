import * as dotenv from 'dotenv';

const environmentName = process.env.ENVIRONMENT_NAME ?? 'development';

if (environmentName === 'development') {
    dotenv.config({ path: `${__dirname}/.env` });
} else {
    dotenv.config({ path: `${__dirname}/.env.prod` });
}

const tags =
    process.env.LOGGLY_TAGS && Array.isArray(process.env.LOGGLY_TAGS)
        ? process.env.LOGGLY_TAGS
        : ['covid19liveupd'];

tags.push(
    'containerV' + process.env.CONTAINER_VERSION,
    'pkgV' + process.env.npm_package_version,
    environmentName
);

let envConfig = {
    ENV: environmentName,
    COVID19API_URL: process.env.COUNTRIESDATA_URL,
    KNOWLEDGEBASE_URL: process.env.KNOWLEDGEBASE_URL,
    KNOWLEDGEBASE_SECRET_KEY: process.env.KNOWLEDGEBASE_SECRET_KEY,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    VIBER_TOKEN: process.env.VIBER_TOKEN,
    CONTAINER_VERSION: process.env.CONTAINER_VERSION,
    LOGGLY_TOKEN: process.env.LOGGLY_TOKEN,
    LOGGLY_SUBDOMAIN: process.env.LOGGLY_SUBDOMAIN ?? 'covid19liveupd',
    LOGGLY_TAGS: tags,
    APP_URL: process.env.APP_URL ?? '',
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY ?? '',
    FIREBASE_AUTHDOMAIN: process.env.FIREBASE_AUTHDOMAIN ?? '',
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL ?? '',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? '',
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ?? '',
    FIREBASE_MESSAGING_SENDER_ID:
        process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID ?? '',
    CHARTSAPI_URL: 'https://quickchart.io/chart',
    IsProduction() {
        return environmentName === 'production';
    },
    IsDevelopment() {
        return environmentName === 'development';
    },
    IsNgRokMode() {
        return this.IsDevelopment();
    },
    features: {
        ScheduledNotification: {
            enabled: process.env.EnableScheduledNotification || false,
            cronExpr: process.env.ScheduledNotificationCronExpr,
        },
    },
};

if (!envConfig.IsProduction()) {
    envConfig = {
        ...envConfig,
        LOGGLY_TAGS: tags,
    };
}

export default envConfig;
