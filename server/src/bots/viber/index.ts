import { Express } from 'express';
import { Bot, Events } from 'viber-bot';
import { logger } from '../../utils/logger';
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
import { ViberBot } from './models';
import { viberUserService } from './services/user';
import { ViberMessageRegistry } from './services/viberMessageRegistry';
import { vStartResponse } from './botResponses/vStartResponse';
import { localizeOnLocales } from '../../services/domain/localization.service';
import { withSingleParameterAfterCommand } from '../../services/domain/registry/withSingleParameterAfterCommand';
import { vActionsResponse } from './botResponses/vActionsResponse';
import { vSettingsLanguageResponse } from './botResponses/vSettingsResponse';
import { vHelpResponse } from './botResponses/vHelpResponse';
import {
    vCountriesTableByContinentResponse,
    vWorldByContinentOverallResponse,
} from './botResponses/vCountriesResponse';
import { vNoResponse } from './botResponses/vNoResponse';
import { vShowCountryByNameStrategyResponse } from './botResponses/vCountryResponse';
import {
    vShowExistingSubscriptionsResponse,
    vSubscribingStrategyResponse,
    vSubscriptionManagerResponse,
} from './botResponses/vSubscribeResponse';
import { vUnsubscribeStrategyResponse } from './botResponses/vUnsubscribeResponse';

export async function runViberBot(
    app: Express,
    appUrl: string,
    viberToken: string
) {
    const bot: ViberBot = new Bot({
        authToken: viberToken,
        name: 'covid19bot',
        avatar: '../../../../assets/cover_image.jpg',
    });
    // It's equivalent for telegram/index.ts 64 line
    app.use('/viber/webhook', bot.middleware());
    bot.setWebhook(`${appUrl}/viber/webhook`);

    const availableLanguages: Array<string> = await viberUserService().getAvailableLanguages();
    const viberMessageRegistry: ViberMessageRegistry = new ViberMessageRegistry(
        bot,
        viberUserService()
    );
    viberMessageRegistry
        .registerMessageHandler([UserRegExps.Start], vStartResponse)
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
                viberMessageRegistry,
                vWorldByContinentOverallResponse,
                vNoResponse
            )
        )
        .registerMessageHandler(
            [UserRegExps.CountryData],
            withSingleParameterAfterCommand(
                viberMessageRegistry,
                vShowCountryByNameStrategyResponse,
                vNoResponse
            )
        )
        // Message handler for feature "Subscriptions"
        .registerMessageHandler(
            [
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.SubscriptionManager
                ),
            ],
            vSubscriptionManagerResponse
        )
        .registerMessageHandler(
            [...localizeOnLocales(availableLanguages, UserMessages.Existing)],
            vShowExistingSubscriptionsResponse
        )
        .registerMessageHandler(
            [UserRegExps.Subscribe, CustomSubscriptions.SubscribeMeOn],
            withSingleParameterAfterCommand(
                viberMessageRegistry,
                vSubscribingStrategyResponse,
                vNoResponse
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
                viberMessageRegistry,
                vUnsubscribeStrategyResponse,
                vNoResponse
            )
        )
        // Message handler for feature "Trends"
        // .registerMessageHandler(
        //     [UserRegExps.Trends],
        //     withSingleParameterAfterCommand(
        //         viberMessageRegistry,
        //         withTwoArgumentsAfterCommand(
        //             viberMessageRegistry,
        //             trendsByCountryResponse,
        //             noResponse,
        //         ),
        //         noResponse,
        //     ),
        // )
        // Message handler for feature  Help
        .registerMessageHandler(
            [
                UserRegExps.Help,
                ...localizeOnLocales(availableLanguages, UserMessages.Help),
            ],
            vHelpResponse
        )
        // Settings
        .registerMessageHandler(
            [
                ...localizeOnLocales(availableLanguages, UserMessages.Language),
                UserSettingsRegExps.Language,
            ],
            withSingleParameterAfterCommand(
                viberMessageRegistry,
                vSettingsLanguageResponse,
                vNoResponse
            )
        )
        // Actions
        .registerMessageHandler([UserActionsRegExps.Close], vActionsResponse);

    // Message handler for feature  Countries / Country
    for (const continent of Object.keys(Continents)) {
        viberMessageRegistry.registerMessageHandler(
            [continent],
            vCountriesTableByContinentResponse(continent)
        );
    }

    bot.on(Events.MESSAGE_RECEIVED, (message, response) => {
        viberMessageRegistry.runCommandHandler({
            ...message,
            chat: { ...response.userProfile },
        });
    });

    bot.on(Events.MESSAGE_SENT, (message, userProfile) => {
        // console.log('message sent', message);
    });

    bot.on(
        Events.CONVERSATION_STARTED,
        (response, isSubscribed, context, onFinish) => {
            viberMessageRegistry.runCommandHandler({
                text: '/start',
                chat: { ...response.userProfile },
            });
        }
    );
    bot.on(Events.ERROR, (err) => {
        logger.log(LogLevel.Error, err, LogCategory.ViberError);
    });

    bot.on(Events.UNSUBSCRIBED, (response) =>
        response.send(
            `We are sorry to hear that, ${response.userProfile?.name}`
        )
    );

    bot.on(Events.SUBSCRIBED, (response) =>
        response.send(`Thanks for subscribing, ${response.userProfile?.name}`)
    );
    return true;
}
