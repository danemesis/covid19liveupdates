// module variables
const devConfig = require('./dev.config.json');

const environmentName = process.env.ENVIRONMENT_NAME || "development";
const tags =  process.env.LOGGLY_TAGS && Array.isArray(process.env.LOGGLY_TAGS) 
?  process.env.LOGGLY_TAGS : ["covid19liveupd"];
tags.push('containerV'+ process.env.CONTAINER_VERSION, 'pkgV' + process.env.npm_package_version, environmentName);

const envConfig = {
    ENV: environmentName,
    COVID19API_URL: process.env.COUNTRIESDATA_URL,
    KNOWLEDGEBASE_URL: process.env.KNOWLEDGEBASE_URL,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    CONTAINER_VERSION: process.env.CONTAINER_VERSION,
    LOGGLY_TOKEN: process.env.LOGGLY_TOKEN,
    LOGGLY_SUBDOMAIN: process.env.LOGGLY_SUBDOMAIN || 'covid19liveupd',
    LOGGLY_TAGS: tags,
    APP_URL: process.env.APP_URL,
    NGROK_URL: "",
    IsProduction(){
        return environmentName === "production";
    },
    IsDevelopment(){
        return environmentName === "development";
    },
    IsNgRokMode(){
        return this.IsDevelopment();
    }
};

let Config = envConfig;
if(!envConfig.IsProduction()){
    Config = {...envConfig, ...devConfig };
    console.log(Config);
    //Force override tags
    Config.LOGGLY_TAGS = envConfig.LOGGLY_TAGS;
}

export default Config;