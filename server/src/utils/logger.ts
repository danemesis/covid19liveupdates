import * as winston from 'winston';
import {Loggly} from 'winston-loggly-bulk';
import environment from "../environments/environment";


if (environment.LOGGLY_TOKEN) {
    winston.add(new Loggly({
        token: environment.LOGGLY_TOKEN,
        subdomain: environment.LOGGLY_SUBDOMAIN,
        tags: environment.LOGGLY_TAGS,
        json: true
    }));
}

export const logger = {
    log(severity, message) {
        winston.log(severity, message);
        if (!environment.IsProduction()) {
            console.log(severity, message);
        }
    }
};
