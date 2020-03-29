import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as baseController from './routes/base/base';
import {runTelegramBot} from "./bots/telegram";

const exec = require('child_process').exec;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('port', port);
app.set('ngrok_url', process.argv[2]);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', baseController.base);

runTelegramBot(app);

// exec(`ngrok http ${port}`, function (error, stdout, stderr) {
//     console.log(error, stdout, stderr);
//     runTelegramBot(app);
// });

app.listen(app.get('port'), () => {
    console.log(('App is running at http://localhost:%d in %s mode. This update inspect?'),
        app.get('port'), app.get('env'));

    console.log('Press CTRL-C to stop\n');
});
