import * as winston from 'winston';
import { Loggly } from 'winston-loggly-bulk';
import environment from '../environments/environment';
import { LogCategory, LogLevel } from '../models/constants';

if (environment.LOGGLY_TOKEN) {
    winston.add(
        new Loggly({
            token: environment.LOGGLY_TOKEN,
            subdomain: environment.LOGGLY_SUBDOMAIN,
            tags: environment.LOGGLY_TAGS,
            json: true,
        })
    );
}

export const logger = {
    log(
        severity: string,
        message: any,
        type?: LogCategory,
        chatId?: number | string
    ) {
        if (typeof message === 'string') {
            message = {
                message,
            };
        }
        if (chatId !== undefined) {
            message.chatId = chatId;
        }
        if (type !== undefined) {
            message.type = type;
        }
        winston.log(severity, message);
        if (!environment.IsProduction()) {
            // tslint:disable-next-line:no-console
            console.log(severity, message);
        }
    },
    error(
        message: any,
        error: Error,
        type?: LogCategory,
        chatId?: number | string
    ) {
        if (typeof message === 'string') {
            message = {
                message,
            };
        }
        message.error = {
            message: error.message,
            stack: error.stack,
            name: error.name,
        };
        this.log(LogLevel.Error, message, type, chatId);
    },
};
