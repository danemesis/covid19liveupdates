import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as baseController from './routes/base/base';
import {runTelegramBot} from "./bots/telegram";
import {runNgrok, stopNgrok} from './runNgrok';
import Config from './environments/environment';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', baseController.base);

const EASE_DELIMITER: string = '==============> ';
const DELIMITER: string = '\n\n==============> ';
let appUrl = Config.APP_URL;

const server = app.listen(PORT, async () => {
    console.log(
        ('App is running at http://localhost:%d in %s mode'),
        PORT,
        app.get('env'),
    );

    console.log('\nPress CTRL-C to stop');

    if (Config.IsNgRokMode()) {
        console.log(`${DELIMITER}Starting ngrok`);
        appUrl = Config.NGROK_URL || await runNgrok(PORT);
        console.log(`${EASE_DELIMITER} NGROK started on ngRokUrl: ${appUrl}`);
    }

    console.log(`${DELIMITER}Starting Telegram bot`);
    runTelegramBot(app, appUrl);
});

process.on('SIGTERM', () => {
    server.close(async () => {
        console.log(`${DELIMITER}Stopping ngrok`);
        if (Config.IsNgRokMode()) {
            await stopNgrok();
        }
        process.exit(0);
    });
});

