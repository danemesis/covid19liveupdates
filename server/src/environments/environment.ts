const environmentName = process.env.ENVIRONMENT_NAME || "development";
const tags =  process.env.LOGGLY_TAGS && Array.isArray(process.env.LOGGLY_TAGS) 
?  process.env.LOGGLY_TAGS : ["covid19liveupd"];
tags.push('containerV'+ process.env.CONTAINER_VERSION, 'pkgV' + process.env.npm_package_version, environmentName);

export const environments = {
    ENV: environmentName,
    COVID19API_URL: process.env.COUNTRIESDATA_URL || 'https://pomber.github.io/covid19',
    KNOWLEDGEBASE_URL: process.env.KNOWLEDGEBASE_URL || 'http://localhost:5000/api/v1',
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
    CONTAINER_VERSION: process.env.CONTAINER_VERSION,
    LOGGLY_TOKEN: process.env.LOGGLY_TOKEN || '',
    LOGGLY_SUBDOMAIN: process.env.LOGGLY_SUBDOMAIN || 'covid19liveupd',
    LOGGLY_TAGS: tags,
    NGROK_URL: '',
    IsProduction(){
        return environmentName === "production";
    }
};