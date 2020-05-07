import {
    countriesTableByContinentResponse,
    worldByContinentOverallResponse,
} from './botResponse/countriesResponse';
import {
    showCountryByFlag,
    showCountryByNameStrategyResponse,
} from './botResponse/countryResponse';
import {
    Continents,
    CustomSubscriptions,
    LogCategory,
    LogLevel,
    UserActionsRegExps,
    UserMessages,
    UserRegExps,
    UserSettingsRegExps,
} from '../../models/constants';
import { showAdvicesHowToBehaveResponse } from './botResponse/adviceResponse';
import { helpInfoResponse } from './botResponse/helpResponse';
import { Express } from 'express';
import {
    cachedCovid19CountriesData,
    getAvailableCountries,
} from '../../services/domain/covid19';
import { Country } from '../../models/country.models';
import { flag } from 'country-emoji';
import { assistantStrategyResponse } from './botResponse/assistantResponse';
import * as TelegramBot from 'node-telegram-bot-api';
import { logger } from '../../utils/logger';
import { startResponse } from './botResponse/startResponse';
import { showAvailableCountriesResponse } from './botResponse/availableResponse';
import {
    showExistingSubscriptionsResponse,
    subscribingStrategyResponse,
    subscriptionManagerResponse,
} from './botResponse/subscribeResponse';
import { SubscriptionType } from '../../models/subscription.models';
import { TelegramMessageRegistry } from './services/registry/telegramMessageRegistry';
import { withTwoArgumentsAfterCommand } from '../../services/domain/registry/withTwoArgumentsAfterCommand';
import { subscriptionNotifierHandler } from './services/subscriptionNotifierManager';
import { unsubscribeStrategyResponse } from './botResponse/unsubscribeResponse';
import { trendsByCountryResponse } from './botResponse/trendResponse';
import { CountrySituationInfo } from '../../models/covid19.models';
import { catchAsyncError } from '../../utils/catchError';
import { runSendScheduledNotificationToUsersJob } from '../../services/infrastructure/scheduler';
import { telegramUserService } from './services/user';
import { withSingleParameterAfterCommand } from '../../services/domain/registry/withSingleParameterAfterCommand';
import { settingsLanguageResponse } from './botResponse/settingsResponse';
import { closeActionResponse } from './botResponse/actionsResponse';
import { localizeOnLocales } from '../../services/domain/localization.service';
import { noResponse } from './botResponse/noResponse';

export async function runTelegramBot(
    app: Express,
    appUrl: string,
    telegramToken: string
) {
    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(telegramToken, { polling: true });
    // This informs the Telegram servers of the new webhook
    bot.setWebHook(`${appUrl}/bot${telegramToken}`);

    // We are receiving updates at the route below!
    app.post(`/bot${telegramToken}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    const availableLanguages: Array<string> = await telegramUserService().getAvailableLanguages();
    const messageHandlerRegistry = new TelegramMessageRegistry(
        bot,
        telegramUserService()
    );
    messageHandlerRegistry
        .registerMessageHandler([UserRegExps.Start], startResponse)
        // Message handler for feature  Countries / Country
        .registerMessageHandler(
            [
                UserRegExps.CountriesData,
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.CountriesData
                ),
            ],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                worldByContinentOverallResponse,
                noResponse
            )
        )
        .registerMessageHandler(
            [
                UserRegExps.AvailableCountries,
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.AvailableCountries
                ),
            ],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                showAvailableCountriesResponse,
                noResponse
            )
        )
        .registerMessageHandler(
            [UserRegExps.CountryData],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                showCountryByNameStrategyResponse,
                noResponse
            )
        )
        // Message handler for feature  Advices
        .registerMessageHandler(
            [
                UserRegExps.Advice,
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.GetAdviceHowToBehave
                ),
            ],
            showAdvicesHowToBehaveResponse
        )
        // Message handler for feature  Help
        .registerMessageHandler(
            [
                UserRegExps.Help,
                ...localizeOnLocales(availableLanguages, UserMessages.Help),
            ],
            helpInfoResponse
        )
        // Message handler for feature  Assistant
        .registerMessageHandler(
            [
                UserRegExps.Assistant,
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.Assistant
                ),
            ],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                assistantStrategyResponse,
                noResponse
            )
        )
        // Message handler for feature  Subscriptions
        .registerMessageHandler(
            [
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.SubscriptionManager
                ),
            ],
            subscriptionManagerResponse
        )
        .registerMessageHandler(
            [...localizeOnLocales(availableLanguages, UserMessages.Existing)],
            showExistingSubscriptionsResponse
        )
        .registerMessageHandler(
            [UserRegExps.Subscribe, CustomSubscriptions.SubscribeMeOn],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                subscribingStrategyResponse,
                noResponse
            )
        )
        .registerMessageHandler(
            [
                CustomSubscriptions.UnsubscribeMeFrom,
                UserRegExps.Unsubscribe,
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.Unsubscribe
                ),
            ],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                unsubscribeStrategyResponse,
                noResponse
            )
        )
        .registerMessageHandler(
            [UserRegExps.Trends],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                withTwoArgumentsAfterCommand(
                    messageHandlerRegistry,
                    trendsByCountryResponse,
                    noResponse
                ),
                noResponse
            )
        )
        // Settings
        .registerMessageHandler(
            [
                ...localizeOnLocales(availableLanguages, UserMessages.Language),
                UserSettingsRegExps.Language,
            ],
            withSingleParameterAfterCommand(
                messageHandlerRegistry,
                settingsLanguageResponse,
                noResponse
            )
        )
        // Actions
        .registerMessageHandler(
            [UserActionsRegExps.Close],
            closeActionResponse
        );

    // Message handler for feature  Countries / Country
    for (const continent of Object.keys(Continents)) {
        messageHandlerRegistry.registerMessageHandler(
            [continent],
            countriesTableByContinentResponse(continent)
        );
    }
    getAvailableCountries().then((countries: Array<Country>) => {
        const single = countries
            .map((c) => flag(c.name)?.trim() ?? undefined)
            .filter((v) => !!v) // TODO: Find flag that we lack for [https://github.com/danbilokha/covid19liveupdates/issues/61]
            .join('><');

        messageHandlerRegistry.registerMessageHandler(
            [`[~${single}~]`],
            showCountryByFlag
        );
    });

    // Sending subscriptions
    cachedCovid19CountriesData.subscribe(
        async (
            countriesData: [
                number,
                Array<[Country, Array<CountrySituationInfo>]>
            ]
        ) => {
            const [err, result] = await catchAsyncError(
                subscriptionNotifierHandler(
                    messageHandlerRegistry,
                    countriesData
                )
            );
            if (err) {
                logger.error(
                    'subscriptionNotifierHandler failed',
                    err,
                    LogCategory.SubscriptionNotifierHandler
                );
            }
        },
        [SubscriptionType.Country]
    );

    bot.on('message', (message) => {
        messageHandlerRegistry.runCommandHandler(message);
    });

    bot.on('polling_error', (err) =>
        logger.log(LogLevel.Error, err, LogCategory.PollingError)
    );
    bot.on('webhook_error', (err) =>
        logger.log(LogLevel.Error, err, LogCategory.WebhookError)
    );
    bot.on('error', (err) =>
        logger.log(LogLevel.Error, err, LogCategory.TelegramError)
    );

    await runSendScheduledNotificationToUsersJob(bot);
    return true;
}
