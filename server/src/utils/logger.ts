import * as winston from 'winston';
import {Loggly} from 'winston-loggly-bulk';
import Config from "../environments/environment";


if(Config.LOGGLY_TOKEN){
    winston.add(new Loggly({
        token: Config.LOGGLY_TOKEN,
        subdomain: Config.LOGGLY_SUBDOMAIN,
        tags: Config.LOGGLY_TAGS,
        json: true
    }));
}

export const logger = {
    log(severity, message) {
        winston.log(severity, message);
        if (!Config.IsProduction()) {
            console.log(severity, message);
        }
    }
}