import * as dotenv from 'dotenv';
import {countriesResponse} from "./botResponse/countriesResponse";
import {greetUser} from "../../utils/messages/userMessage";
import {showCountries, showCountryByName, showCountryByFlag} from "./botResponse/countryResponse";
import {REXEX_ALL_CODES, UserMessages, UserRegExps} from "../../models/constants";
import {showAdvicesHowToBehave} from "./botResponse/advicesResponse";
import {showHelpInfo} from "./botResponse/helpResponse";
import {Express} from "express";
import {MessageRegistry} from "./utils/messageRegistry";
import {getKeyboard} from "./utils/keyboard";
import {
    getAvailableCountries,
} from "../../services/domain/covid19";
import {Country} from "../../models/country";
import {flag} from 'country-emoji';


const TelegramBot = require('node-telegram-bot-api');

function runTelegramBot(app: Express, ngRokUrl: string) {
    dotenv.config({path: `${__dirname}/.env`});

    // replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TELEGRAM_TOKEN ?? '';

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});

    // This informs the Telegram servers of the new webhook
    bot.setWebHook(`${ngRokUrl}/bot${token}`);

    // We are receiving updates at the route below!
    app.post(`/bot${token}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    bot.onText(/\/start/, (message) => {
        bot.sendMessage(
            message.chat.id,
            `${greetUser(message.from)} /n`,
            getKeyboard(message)
        );

        showHelpInfo(bot, message);
    });

    const registry = new MessageRegistry(bot);

    


    registry
        .Register(UserMessages.AllCountries, countriesResponse)
        .Register(UserRegExps.All, countriesResponse)
        .Register(UserMessages.CountriesAvailable, showCountries)
        .Register(UserRegExps.Countries, showCountries)
        .Register(UserRegExps.Country, showCountryByName)
        .Register(UserMessages.GetAdvicesHowToBehave, showAdvicesHowToBehave)
        .Register(UserRegExps.Advices, showAdvicesHowToBehave)
        .Register(UserMessages.Help, showHelpInfo)
        .Register(UserRegExps.Help, showHelpInfo);

        getAvailableCountries()
        .then((countries: Array<Country>) => {
            const single = countries
            .map(c => flag(c.name))
            .join('|');
            registry.Register(`[${single}]`, showCountryByFlag);
            });


    bot.on("callback_query", (query) => {
        bot.answerCallbackQuery(query.id, { text: "Action received!" })
            .then(function () {
            bot.sendMessage(query.from.id, "Hey there! You clicked on an inline button! ;) So, as you saw, the support library works!");
        });
    });

    bot.on('message', (message, match) => {
        console.log('all messages', match, message);
    });
    // ALL CODES
    bot.onText(REXEX_ALL_CODES, (message, match) => {
        console.log('REXEX_ALL_CODES', match, message);
    });

    bot.on("polling_error", (err) => console.log('polling_error', err));
    bot.on("webhook_error", (err) => console.log('webhook_error', err));
    bot.on("error", (err) => console.log('error', err));
}



export {runTelegramBot};