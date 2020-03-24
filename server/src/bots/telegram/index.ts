import * as dotenv from 'dotenv';
import {countries} from "./text/countries";
import {greetUser} from "./utils/message";
import {showCountries, showCountry} from "./text/country";
import {REXEX_ALL_CODES} from "../../models/constants";

const TelegramBot = require('node-telegram-bot-api');

function runTelegramBot(app) {
    dotenv.config({path: `${__dirname}/.env`});

// replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TELEGRAM_TOKEN ?? '';

// Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});

    // This informs the Telegram servers of the new webhook.
    // TODO: MAKE IT AUTOMATICALLY
    bot.setWebHook(`https://54daaf4a.ngrok.io/bot${token}`);

    // We are receiving updates at the route below!
    app.post(`/bot${token}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, `${greetUser(msg.from)}`, {
            "reply_markup": {
                "keyboard": [["Get data for all countries", "For specific country"]]
            }
        });

    });

    bot.onText(/\/all/, (message) => countries(bot, message));
    bot.onText(/Get data for all countries/g, (message) => countries(bot, message));

    bot.onText(/\/countries/, (message) => showCountries(bot, message));
    bot.onText(/For specific country/g, (message) => showCountries(bot, message));

    bot.onText(/\/country/, (message, match) => showCountry(bot, message, match));

    // ALL CODES
    bot.onText(REXEX_ALL_CODES, (message, match) => {
        console.log('REXEX_ALL_CODES'. match, message);
    });

    bot.on("polling_error", (err) => console.log('polling_error', err));
    bot.on("webhook_error", (err) => console.log('webhook_error', err));
    bot.on("error", (err) => console.log('error', err));
}

export {runTelegramBot};