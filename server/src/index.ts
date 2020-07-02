import * as express from 'express';
import * as baseController from './routes/base/base';
import * as logsController from './routes/logs';
import { runTelegramBot } from './bots/telegram';
import { runNgrok, stopNgrok } from './runNgrok';
import environments from './environments/environment';
import { initFirebase } from './services/infrastructure/firebase';
import {
    CONSOLE_LOG_DELIMITER,
    CONSOLE_LOG_EASE_DELIMITER,
    DEFAULT_LOCALE,
    LogCategory,
    LogLevel,
} from './models/constants';
import * as firebase from 'firebase';
import { checkCovid19Updates } from './services/infrastructure/scheduler';
import { catchAsyncError } from './utils/catchError';
import * as i18n from 'i18n';
import { runViberBot } from './bots/viber';
import * as bodyParser from 'body-parser';
import { logger } from './utils/logger';
import * as path from 'path';

export const app = express();
const PORT = process.env.PORT || 3000;
const environmentName = process.env.ENVIRONMENT_NAME;

// Has to be commented because Viber lib cannot work properly with it
// app.use(bodyParser.json());
// Has to be uncommented because Telegram lib cannot work properly without it
app.use(bodyParser.urlencoded({ extended: true }));

// Simple information of the API
app.get('/', baseController.base);
app.get('/logs', logsController.logs);

i18n.configure({
    directory: path.resolve('./locales'),
    defaultLocale: DEFAULT_LOCALE,
});

const server = app.listen(PORT, async () => {
    let appUrl = environments.APP_URL;
    // tslint:disable-next-line:no-console
    console.log(
        'App is running at http://localhost:%d in %s mode',
        PORT,
        environmentName
    );

    if (environments.IsNgRokMode()) {
        const [err, ngRookUrl] = await catchAsyncError(
            environments.APP_URL
                ? Promise.resolve(environments.APP_URL)
                : runNgrok(PORT)
        );
        // tslint:disable-next-line:no-console
        console.log(
            `${CONSOLE_LOG_EASE_DELIMITER} NGROK started on ngRokUrl: ${ngRookUrl}`
        );
        appUrl = ngRookUrl;
    }

    const [err, fireBaseApp] = initFirebase(environments);
    if (err) {
        // tslint:disable-next-line:no-console
        console.log(
            `${CONSOLE_LOG_DELIMITER}Firebase did not start. Error ${err.name}, ${err.message}. Stack: ${err.stack}`
        );
    }

    checkCovid19Updates();
    // tslint:disable-next-line:no-console
    console.log(`${CONSOLE_LOG_DELIMITER}Starting Telegram bot`);
    const [tErr, tResult] = await catchAsyncError(
        runTelegramBot(app, appUrl, environments.TELEGRAM_TOKEN)
    );
    if (tErr) {
        logger.log(LogLevel.Error, tErr, LogCategory.TelegramError);
    } else {
        // tslint:disable-next-line:no-console
        console.log(`${CONSOLE_LOG_EASE_DELIMITER}Telegram started`);
    }

    // tslint:disable-next-line:no-console
    console.log(`${CONSOLE_LOG_DELIMITER}Starting Viber bot`);
    const [vErr, vResult] = await catchAsyncError(
        runViberBot(app, appUrl, environments.VIBER_TOKEN)
    );
    if (vErr) {
        logger.log(LogLevel.Error, vErr, LogCategory.ViberError);
    } else {
        // tslint:disable-next-line:no-console
        console.log(`${CONSOLE_LOG_EASE_DELIMITER}Viber started`);
    }
});

process.on('SIGTERM', () => {
    server.close(async () => {
        // tslint:disable-next-line:no-console
        console.log(`${CONSOLE_LOG_DELIMITER}Stopping ngrok`);
        if (environments.IsNgRokMode()) {
            await stopNgrok();
        }

        // If there are any subscription to Firebase - unsubscribe
        if (firebase.database()) {
            firebase.database().ref().off();
        }

        process.exit(0);
    });
});
