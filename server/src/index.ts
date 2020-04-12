import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as baseController from './routes/base/base';
import {runTelegramBot} from "./bots/telegram";
import {runNgrok, stopNgrok} from './runNgrok';
import environments from './environments/environment';
import {initFirebase} from "./services/infrastructure/firebase";
import {CONSOLE_LOG_DELIMITER, CONSOLE_LOG_EASE_DELIMITER} from "./models/constants";
import * as firebase from "firebase";
import {checkCovid19Updates} from "./services/infrastructure/scheduler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', baseController.base);

const server = app.listen(PORT, async () => {
    let appUrl = environments.APP_URL;

    console.log(
        ('App is running at http://localhost:%d in %s mode'),
        PORT,
        app.get('env'),
    );

    console.log('\nPress CTRL-C to stop');

    if (environments.IsNgRokMode()) {
        console.log(`${CONSOLE_LOG_DELIMITER}Starting ngrok`);
        appUrl = environments.NGROK_URL || await runNgrok(PORT);
        console.log(`${CONSOLE_LOG_EASE_DELIMITER} NGROK started on ngRokUrl: ${appUrl}`);
    }

    const [e, isFirebaseInit] = initFirebase(environments);
    if (!isFirebaseInit) {
        console.log(`${CONSOLE_LOG_DELIMITER}Firebase did not start. Error ${e.name}, ${e.message}. Stack: ${e.stack}`);
    }

    checkCovid19Updates();

    console.log(`${CONSOLE_LOG_DELIMITER}Starting Telegram bot`);
    runTelegramBot(app, appUrl);
});

process.on('SIGTERM', () => {
    server.close(async () => {
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

