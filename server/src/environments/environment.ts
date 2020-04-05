import * as dotenv from "dotenv";

const environmentName = process.env.ENVIRONMENT_NAME ?? 'development';

if (environmentName === 'development') {
    dotenv.config({path: `${__dirname}/.env`});
} else {
    dotenv.config({path: `${__dirname}/.env.prod`});
}

const tags = process.env.LOGGLY_TAGS && Array.isArray(process.env.LOGGLY_TAGS)
    ? process.env.LOGGLY_TAGS
    : ["covid19liveupd"];

tags.push('containerV' + process.env.CONTAINER_VERSION, 'pkgV' + process.env.npm_package_version, environmentName);

let envConfig = {
    ENV: environmentName,
    COVID19API_URL: process.env.COUNTRIESDATA_URL,
    KNOWLEDGEBASE_URL: process.env.KNOWLEDGEBASE_URL,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    CONTAINER_VERSION: process.env.CONTAINER_VERSION,
    LOGGLY_TOKEN: process.env.LOGGLY_TOKEN,
    LOGGLY_SUBDOMAIN: process.env.LOGGLY_SUBDOMAIN ?? 'covid19liveupd',
    LOGGLY_TAGS: tags,
    APP_URL: process.env.APP_URL ?? '',
    NGROK_URL: process.env.APP_URL ?? '',
    IsProduction() {
        return environmentName === "production";
    },
    IsDevelopment() {
        return environmentName === "development";
    },
    IsNgRokMode() {
        return this.IsDevelopment();
    }
};

if(!envConfig.IsProduction()){
    envConfig = {
        ...envConfig,
        LOGGLY_TAGS: tags
    };
}

export default envConfig;