import {countriesByContinent, countriesResponse} from './botResponse/countriesResponse';
import {showCountryByFlag, showCountryByNameStrategyResponse} from './botResponse/countryResponse';
import {Continents, CustomSubscriptions, UserMessages, UserRegExps} from '../../models/constants';
import {showAdvicesHowToBehaveResponse} from './botResponse/adviceResponse';
import {showHelpInfoResponse} from './botResponse/helpResponse';
import {Express} from 'express';
import {cachedCovid19CountriesData, getAvailableCountries,} from '../../services/domain/covid19';
import {Country} from '../../models/country.models';
import {flag} from 'country-emoji';
import {assistantStrategyResponse} from './botResponse/assistantResponse';
import * as TelegramBot from 'node-telegram-bot-api';
import Config from '../../environments/environment';
import {logger} from '../../utils/logger';
import {startResponse} from './botResponse/startResponse';
import {showAvailableCountriesResponse} from './botResponse/availableResponse';
import {
    showExistingSubscriptionsResponse,
    subscribingStrategyResponse,
    subscriptionManagerResponse
} from './botResponse/subscribeResponse';
import {SubscriptionType} from '../../models/subscription.models';
import {registry, withCommandArgument} from './services/messageRegistry';
import {subscriptionNotifierHandler} from './services/subscriptionNotifierManager';
import {unsubscribeStrategyResponse} from './botResponse/unsubscribeResponse';
import {showTrendsByCountry} from './botResponse/trendResponse';

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
    registry.addSingleParameterCommands([
        UserRegExps.CountryData,
        UserRegExps.Trends
    ]);

    registry
        .registerMessageHandler(UserRegExps.Start, startResponse)
        // Feature: Countries / Country
        .registerMessageHandler(UserMessages.CountriesData, countriesResponse)
        .registerMessageHandler(UserRegExps.CountriesData, countriesResponse)
        .registerMessageHandler(UserMessages.AvailableCountries, showAvailableCountriesResponse)
        .registerMessageHandler(UserRegExps.AvailableCountries, showAvailableCountriesResponse)
        .registerMessageHandler(UserRegExps.CountryData, showCountryByNameStrategyResponse)
        // Feature: Advices
        .registerMessageHandler(UserMessages.GetAdvicesHowToBehave, showAdvicesHowToBehaveResponse)
        .registerMessageHandler(UserRegExps.Advice, showAdvicesHowToBehaveResponse)
        // Feature: Help
        .registerMessageHandler(UserMessages.Help, showHelpInfoResponse)
        .registerMessageHandler(UserRegExps.Help, showHelpInfoResponse)
        // Feature: Assistant
        .registerMessageHandler(UserMessages.Assistant, assistantStrategyResponse)
        .registerMessageHandler(UserRegExps.Assistant, assistantStrategyResponse)
        // Feature: Subscriptions
        .registerMessageHandler(UserMessages.SubscriptionManager, subscriptionManagerResponse)
        .registerMessageHandler(UserMessages.Existing, showExistingSubscriptionsResponse)
        .registerMessageHandler(UserRegExps.Subscribe, subscribingStrategyResponse)
        .registerMessageHandler(UserRegExps.Unsubscribe, unsubscribeStrategyResponse)
        .registerMessageHandler(UserRegExps.Trends, withCommandArgument(showTrendsByCountry));
    registry.registerCallBackQueryHandler(CustomSubscriptions.SubscribeMeOn, subscribingStrategyResponse);
    registry.registerCallBackQueryHandler(CustomSubscriptions.UnsubscribeMeFrom, unsubscribeStrategyResponse);
    registry.registerCallBackQueryHandler(UserMessages.Existing, showExistingSubscriptionsResponse);
    registry.registerCallBackQueryHandler(UserMessages.Unsubscribe, unsubscribeStrategyResponse);
    registry.registerCallBackQueryHandler(UserMessages.Help, showHelpInfoResponse);
    registry.registerCallBackQueryHandler(UserRegExps.Trends, withCommandArgument(showTrendsByCountry));


    // Feature: Countries / Country
    for (const continent of Object.keys(Continents)) {
        registry.registerCallBackQueryHandler(continent, countriesByContinent(continent));
    }
    // Feature: Countries / Country
    getAvailableCountries()
        .then((countries: Array<Country>) => {
            const single = countries
                .map(c => flag(c.name)?.trim() ?? undefined)
                .filter(v => !!v) // TODO: Find flag that we lack for [https://github.com/danbilokha/covid19liveupdates/issues/61]
                .join('//');

            registry.registerMessageHandler(`[~${single}~]`, showCountryByFlag);
        });

    // Feature: Subscriptions
    cachedCovid19CountriesData.subscribe(
        subscriptionNotifierHandler,
        [SubscriptionType.Country]
    );

    bot.on('message', (message, ...args) => {
        logger.log('info', {
            ...message,
        });
        registry.runCommandHandler(message);
    });

    bot.on('polling_error', (err) => logger.log('error', err));
    bot.on('webhook_error', (err) => logger.log('error', err));
    bot.on('error', (err) => logger.log('error', err));
}

export {runTelegramBot};
