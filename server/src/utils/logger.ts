import * as winston from 'winston';
import {Loggly} from 'winston-loggly-bulk';
import environment from '../environments/environment';
import {LogglyModels} from '../models/loggly.models';


if (environment.LOGGLY_TOKEN) {
    winston.add(new Loggly({
        token: environment.LOGGLY_TOKEN,
        subdomain: environment.LOGGLY_SUBDOMAIN,
        tags: environment.LOGGLY_TAGS,
        json: true
    }));
}

export const logger = {
    log(severity: string, message: any) {
        winston.log(severity, message);
        if (!environment.IsProduction()) {
            // tslint:disable-next-line:no-console
            console.log(severity, message);
        }
    }
};
