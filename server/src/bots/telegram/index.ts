import * as dotenv from 'dotenv';
import {getUserName} from "./utils/message";

const TelegramBot = require('node-telegram-bot-api');

function runTelegramBot(app) {
    dotenv.config({path: `${__dirname}/.env`});

// replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TELEGRAM_TOKEN ?? '';

// Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});

    // This informs the Telegram servers of the new webhook.
    bot.setWebHook(`https://4310ca24.ngrok.io/bot${token}`);

    // We are receiving updates at the route below!
    app.post(`/bot${token}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, "Welcome", {
            "reply_markup": {
                "keyboard": [["Sample text", "Second sample"], ["Keyboard"], ["I'm robot"]]
            }
        });

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
        console.log(message);
        const chatId = message.chat.id;

        // send a message to the chat acknowledging receipt of their message
        bot.sendMessage(chatId, `Дякую за повідомлення, ${getUserName(message.from)}. Ми працюємо над нашим ботом, чекайте на оновлення.`);
    });
}

export {runTelegramBot};