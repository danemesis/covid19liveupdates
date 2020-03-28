import * as dotenv from 'dotenv';
import {countriesResponse} from "./botResponse/countriesResponse";
import {greetUser} from "../../utils/messages/userMessage";
import {showCountries, showCountry} from "./botResponse/countryResponse";
import {REXEX_ALL_CODES, UserMessages, UserRegExps} from "../../models/constants";
import {showAdvicesHowToBehave} from "./botResponse/advicesResponse";
import {showHelpInfo} from "./botResponse/helpResponse";

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
        bot.sendMessage(
            msg.chat.id,
            `${greetUser(msg.from)}`,
            {
                "reply_markup": {
                    "keyboard": [
                        [UserMessages.AllCountries, UserMessages.CountriesAvailable],
                        [UserMessages.GetAdvicesHowToBehave],
                        [UserMessages.Help]
                    ]
                }
            }
        );

    });

    // 1
    const allCountriesMessageRegExp = new RegExp(UserMessages.AllCountries, 'g');
    bot.onText(allCountriesMessageRegExp, (message) => countriesResponse(bot, message));
    const allCountriesRegExp = new RegExp(UserRegExps.All);
    bot.onText(allCountriesRegExp, (message) => countriesResponse(bot, message));

    // 2
    const byCountryNamesMessageRegExp = new RegExp(UserMessages.CountriesAvailable, 'g');
    bot.onText(byCountryNamesMessageRegExp, (message) => showCountries(bot, message));
    const byCountryNamesRegExp = new RegExp(UserRegExps.Countries);
    bot.onText(byCountryNamesRegExp, (message) => showCountries(bot, message));

    // 3
    const countryRegExp = new RegExp(UserRegExps.Country);
    bot.onText(countryRegExp, (message, match) => showCountry(bot, message, match));


    // 4
    const getAdvicesHowToBehaveMessageRegExp = new RegExp(UserMessages.GetAdvicesHowToBehave, 'g');
    bot.onText(getAdvicesHowToBehaveMessageRegExp, (message) => showAdvicesHowToBehave(bot, message));
    const getAdvicesHowToBehaveRegExp = new RegExp(UserRegExps.Advices);
    bot.onText(getAdvicesHowToBehaveRegExp, (message) => showAdvicesHowToBehave(bot, message));

    // 5
    const helpMessageRegExp = new RegExp(UserMessages.Help, 'g');
    bot.onText(helpMessageRegExp, (message) => showHelpInfo(bot, message));
    const helpRegExp = new RegExp(UserRegExps.Help);
    bot.onText(helpRegExp, (message) => showHelpInfo(bot, message));

    // ALL CODES
    bot.onText(REXEX_ALL_CODES, (message, match) => {
        console.log('REXEX_ALL_CODES'.match, message);
    });

    bot.on("polling_error", (err) => console.log('polling_error', err));
    bot.on("webhook_error", (err) => console.log('webhook_error', err));
    bot.on("error", (err) => console.log('error', err));
}

export {runTelegramBot};