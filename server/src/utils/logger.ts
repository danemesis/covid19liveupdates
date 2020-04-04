import * as winston from 'winston';
import {Loggly} from 'winston-loggly-bulk';
import {environments} from "../environments/environment";

winston.add(new Loggly({
    token: environments.LOGGLY_TOKEN,
    subdomain: environments.LOGGLY_SUBDOMAIN,
    tags: environments.LOGGLY_TAGS,
    json: true
}));

export const logger = {
    log(severity, message) {
        winston.log(severity, message);
        if (!environments.IsProduction()) {
            console.log(severity, message);
        }
    }
}