import {countriesByContinent, countriesResponse} from "./botResponse/countriesResponse";
import {showCountryByFlag, showCountryByNameResponse} from "./botResponse/countryResponse";
import {Continents, CustomSubscriptions, UserMessages, UserRegExps} from "../../models/constants";
import {showAdvicesHowToBehaveResponse} from "./botResponse/adviceResponse";
import {showHelpInfoResponse} from "./botResponse/helpResponse";
import {Express} from "express";
import {MessageRegistry, registry} from "./services/messageRegistry";
import {cachedCovid19CountriesData, getAvailableCountries,} from "../../services/domain/covid19";
import {Country} from "../../models/country.models";
import {flag} from 'country-emoji';
import {assistantStrategyResponse} from "./botResponse/assistantResponse";
import * as TelegramBot from 'node-telegram-bot-api';
import Config from "../../environments/environment";
import {logger} from "../../utils/logger";
import {startResponse} from './botResponse/startResponse';
import {showAvailableCountriesResponse} from "./botResponse/availableResponse";
import {subscribingStrategyResponse} from "./botResponse/subscribeResponse";
import {getTelegramSubscriptionsHandler} from "./services/storage";
import {SubscriptionType} from "../../models/subscription.models";

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

    registry.setBot(bot); // TODO: DO IT COOLER
    registry
        .registerMessageHandler(UserRegExps.Start, startResponse)
        .registerMessageHandler(UserMessages.CountriesData, countriesResponse)
        .registerMessageHandler(UserRegExps.CountriesData, countriesResponse)
        .registerMessageHandler(UserMessages.AvailableCountries, showAvailableCountriesResponse)
        .registerMessageHandler(UserRegExps.AvailableCountries, showAvailableCountriesResponse)
        .registerMessageHandler(UserRegExps.CountryData, showCountryByNameResponse)
        .registerMessageHandler(UserMessages.GetAdvicesHowToBehave, showAdvicesHowToBehaveResponse)
        .registerMessageHandler(UserRegExps.Advice, showAdvicesHowToBehaveResponse)
        .registerMessageHandler(UserMessages.Help, showHelpInfoResponse)
        .registerMessageHandler(UserRegExps.Help, showHelpInfoResponse)
        .registerMessageHandler(UserMessages.Assistant, assistantStrategyResponse)
        .registerMessageHandler(UserRegExps.Assistant, assistantStrategyResponse)
        .registerMessageHandler(UserMessages.MySubscriptions, subscribingStrategyResponse)
        .registerMessageHandler(UserRegExps.Subscribe, subscribingStrategyResponse);
    for (let continent in Continents) {
        registry.registerCallBackQueryHandler(continent, countriesByContinent(continent));
    }
    for (let customSubscriptionsKey in CustomSubscriptions) {
        registry.registerCallBackQueryHandler(CustomSubscriptions[customSubscriptionsKey], subscribingStrategyResponse)
    }

    getAvailableCountries()
        .then((countries: Array<Country>) => {
            const single = countries
                .map(c => flag(c.name))
                .join('|');
            registry.registerMessageHandler(`[${single}]`, showCountryByFlag);
        });

    // listenTelegramUsersSubscriptionsChanges(
    cachedCovid19CountriesData.subscribe(
        getTelegramSubscriptionsHandler,
        [SubscriptionType.Country]
    );
    // );

    bot.on('message', (message, ...args) => {
        logger.log('info', message);
        logger.log('info', args);
    });

    bot.on("polling_error", (err) => logger.log('error', err));
    bot.on("webhook_error", (err) => logger.log('error', err));
    bot.on("error", (err) => logger.log('error', err));
}

export {runTelegramBot};