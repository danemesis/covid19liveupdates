import * as dotenv from 'dotenv';
import {getUserName} from "./utils/message";
import {getData} from "../../api/covid19";
import {getChatId} from "./utils/chat";

const TelegramBot = require('node-telegram-bot-api');

function runTelegramBot(app) {
    dotenv.config({path: `${__dirname}/.env`});

// replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TELEGRAM_TOKEN ?? '';

// Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});

    // This informs the Telegram servers of the new webhook.
    // TODO: MAKE IT AUTOMATICALLY
    bot.setWebHook(`https://97d74d9f.ngrok.io/bot${token}`);

    // We are receiving updates at the route below!
    app.post(`/bot${token}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, "Welcome", {
            "reply_markup": {
                "keyboard": [["Get data for all countries"]]
            }
        });

    });

    bot.onText('Get data for all countries', (msg) => {
        getData()
            .then((data: Array<unknown>) => {
                let totalDeath = 0;
                let totalRecovered = 0;

                data
                    .forEach(({confirmed, deaths, recovered}) => {
                        totalDeath += deaths;
                        totalRecovered += recovered;
                    });

                bot.sendMessage(getChatId(msg), `We've calculated total recovered: ${totalRecovered} and death: ${totalDeath}`);
            })

    });

// Matches "/echo [whatever]"
    bot.onText(/\/echo (.+)/, (msg, match) => {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content
        // of the message

        const chatId = msg.chat.id;
        const resp = match[1]; // the captured "whatever"

        // send back the matched "whatever" to the chat
        bot.sendMessage(chatId, resp);
    });

// Listen for any kind of message. There are different kinds of
// messages.
    bot.on('message', (message) => {
        const chatId = message.chat.id;

        // send a message to the chat acknowledging receipt of their message
        bot.sendMessage(chatId, `Thank you for your message, ${getUserName(message.from)}. We're working on this bot to make it even better.`);
    });
}

export {runTelegramBot};