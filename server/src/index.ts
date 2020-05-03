import * as express from 'express';
import * as baseController from './routes/base/base';
import { runTelegramBot } from './bots/telegram';
import { runNgrok, stopNgrok } from './runNgrok';
import environments from './environments/environment';
import { initFirebase } from './services/infrastructure/firebase';
import {
    CONSOLE_LOG_DELIMITER,
    CONSOLE_LOG_EASE_DELIMITER,
    DEFAULT_LOCALE,
} from './models/constants';
import * as firebase from 'firebase';
import { checkCovid19Updates } from './services/infrastructure/scheduler';
import { catchAsyncError } from './utils/catchError';
import * as i18n from 'i18n';
import { runViberBot } from './bots/viber';
import * as bodyParser from 'body-parser';

export const app = express();
const PORT = process.env.PORT || 3000;
const environmentName = process.env.ENVIRONMENT_NAME;

app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', baseController.base);

i18n.configure({
    directory: __dirname + '/locales',
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
    runTelegramBot(app, appUrl, environments.TELEGRAM_TOKEN);

    // tslint:disable-next-line:no-console
    console.log(`${CONSOLE_LOG_DELIMITER}Starting Viber bot`);
    runViberBot(app, appUrl, environments.VIBER_TOKEN);
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
