import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as baseController from './routes/base/base';
import {runTelegramBot} from "./bots/telegram";
import {runNgrok, stopNgrok} from './runNgrok';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', baseController.base);

const EASE_DELIMITER: string = '==============> ';
const DELIMITER: string = '\n\n==============> ';
let ngRokUrl = '';

const server = app.listen(app.get('port'), async () => {
    console.log(
        ('App is running at http://localhost:%d in %s mode'),
        app.get('port'),
        app.get('env'),
    );

    console.log('\nPress CTRL-C to stop');

    console.log(`${DELIMITER}Starting ngrok`);
    ngRokUrl = await runNgrok(app.get('port'));

    app.set('ngRokUrl', ngRokUrl);
    process.env.NG_ROK_URL = ngRokUrl;
    console.log(`${EASE_DELIMITER} ngRokUrl ${ngRokUrl}`);

    console.log(`${DELIMITER}Starting Telegram bot`);
    runTelegramBot(app, ngRokUrl);
});

process.on('SIGTERM', () => {
    server.close(async () => {
        console.log(`${DELIMITER}Stopping ngrok`);
        await stopNgrok(ngRokUrl);
        process.exit(0);
    });
});

