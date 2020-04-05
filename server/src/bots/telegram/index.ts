import {countries, countriesByContinent} from "./botResponse/countriesResponse";
import {showCountries, showCountryByFlag, showCountryByName} from "./botResponse/countryResponse";
import {Continents, UserMessages, UserRegExps} from "../../models/constants";
import {showAdvicesHowToBehave} from "./botResponse/advicesResponse";
import {showHelpInfo} from "./botResponse/helpResponse";
import {Express} from "express";
import {MessageRegistry} from "./utils/messageRegistry";
import {getAvailableCountries,} from "../../services/domain/covid19";
import {Country} from "../../models/country.models";
import {flag} from 'country-emoji';
import {assistantStrategy} from "./botResponse/quetionResponse";
import * as TelegramBot from 'node-telegram-bot-api';
import Config from "../../environments/environment";
import {logger} from "../../utils/logger";
import {startResponse} from './botResponse/startResponse';

function runTelegramBot(app: Express, ngRokUrl: string) {
    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(Config.TELEGRAM_TOKEN, {polling: true});

    // This informs the Telegram servers of the new webhook
    bot.setWebHook(`${ngRokUrl}/bot${Config.TELEGRAM_TOKEN}`);

    // We are receiving updates at the route below!
    app.post(`/bot${Config.TELEGRAM_TOKEN}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    const registry = new MessageRegistry(bot);
    registry
        .Register(UserRegExps.Start, startResponse)
        .Register(UserMessages.AllCountries, countries)
        .Register(UserRegExps.All, countries)
        .Register(UserMessages.CountriesAvailable, showCountries)
        .Register(UserRegExps.Countries, showCountries)
        .Register(UserRegExps.Country, showCountryByName)
        .Register(UserMessages.GetAdvicesHowToBehave, showAdvicesHowToBehave)
        .Register(UserRegExps.Advices, showAdvicesHowToBehave)
        .Register(UserMessages.Help, showHelpInfo)
        .Register(UserRegExps.Help, showHelpInfo)
        .Register(UserMessages.Assistant, assistantStrategy)
        .Register(UserRegExps.Assistant, assistantStrategy);

    registry.RegisterCallBackQuery();

    for (let item in Continents) {
        registry.RegisterCallBackQueryHandler(item, countriesByContinent(item));
    }

    getAvailableCountries()
        .then((countries: Array<Country>) => {
            const single = countries
                .map(c => flag(c.name))
                .join('|');
            registry.Register(`[${single}]`, showCountryByFlag);
        });

    bot.on('message', (message) => logger.log('info', message));
    bot.on("polling_error", (err) => logger.log('error', err));
    bot.on("webhook_error", (err) => logger.log('error', err));
    bot.on("error", (err) => logger.log('error', err));
}

export {runTelegramBot};