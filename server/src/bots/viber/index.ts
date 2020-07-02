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
import { ViberBot, ViberUserMessages } from './models';
import { viberUserService } from './services/user';
import { ViberMessageRegistry } from './services/viberMessageRegistry';
import { vStartResponse } from './botResponses/vStartResponse';
import { localizeOnLocales } from '../../services/domain/localization.service';
import { withSingleParameterAfterCommand } from '../../services/domain/registry/withSingleParameterAfterCommand';
import {
    vActionsResponse,
    vMainMenuResponse,
    vOnConversationStartResponse,
} from './botResponses/vActionsResponse';
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
import { cachedCovid19CountriesData } from '../../services/domain/covid19';
import { Country } from '../../models/country.models';
import { CountrySituationInfo } from '../../models/covid19.models';
import { catchAsyncError } from '../../utils/catchError';
import { subscriptionNotifierHandler } from '../../services/domain/subscription.service';
import { SubscriptionType } from '../../models/subscription.models';
import { viberStorage } from './services/storage';
import { withTwoArgumentsAfterCommand } from '../../services/domain/registry/withTwoArgumentsAfterCommand';
import { vTrendsByCountryResponse } from './botResponses/vTrendResponse';
import { vAdviceResponse } from './botResponses/vAdviceResponse';
import { vAssistantStrategyResponse } from './botResponses/vAssistantResponse';
import { runSendScheduledNotificationToUsersJob } from '../../services/infrastructure/scheduler';
import { createErrFile } from '../../services/infrastructure/createAndWriteToFile';

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
        // Message handler for feature  Advices
        .registerMessageHandler(
            [
                UserRegExps.Advice,
                ...localizeOnLocales(
                    availableLanguages,
                    UserMessages.GetAdviceHowToBehave
                ),
            ],
            vAdviceResponse
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
        .registerMessageHandler(
            [UserRegExps.Trends],
            withSingleParameterAfterCommand(
                viberMessageRegistry,
                withTwoArgumentsAfterCommand(
                    viberMessageRegistry,
                    vTrendsByCountryResponse,
                    vNoResponse
                ),
                vNoResponse
            )
        )
        // Message handler for feature  Help
        .registerMessageHandler(
            [
                UserRegExps.Help,
                ...localizeOnLocales(availableLanguages, UserMessages.Help),
            ],
            vHelpResponse
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
                viberMessageRegistry,
                vAssistantStrategyResponse,
                vNoResponse
            )
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
        .registerMessageHandler([UserActionsRegExps.Close], vActionsResponse)
        // Viber - only features
        .registerMessageHandler(
            [
                ...localizeOnLocales(
                    availableLanguages,
                    ViberUserMessages.MainMenu
                ),
            ],
            vMainMenuResponse
        );

    // Message handler for feature  Countries / Country
    for (const continent of Object.keys(Continents)) {
        viberMessageRegistry.registerMessageHandler(
            [continent],
            vCountriesTableByContinentResponse(continent)
        );
    }

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
                    viberMessageRegistry,
                    viberStorage(),
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

    let botFirstMessage = false;
    bot.on(Events.MESSAGE_RECEIVED, async (message, response) => {
        if (botFirstMessage) {
            botFirstMessage = false;

            const [err, res] = await catchAsyncError(
                viberMessageRegistry.runCommandHandler({
                    text: '/start',
                    chat: {
                        ...response.userProfile,
                    },
                })
            );
            if (err) {
                logger.log(LogLevel.Error, err, LogCategory.ViberError);
            }

            return;
        }

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
        async (response, isSubscribed, context, onFinish) => {
            await vOnConversationStartResponse({
                bot,
                message: undefined,
                chatId: response.userProfile.id,
                user: response.userProfile,
            });

            botFirstMessage = true;
        }
    );
    bot.on(Events.ERROR, (err) => {
        logger.log(LogLevel.Error, err, LogCategory.ViberError);
        createErrFile(err);
    });

    bot.on(Events.UNSUBSCRIBED, (response) =>
        logger.log(
            LogLevel.Error,
            `User unsubscribed, ${response.userProfile?.id}`,
            LogCategory.ViberError
        )
    );

    bot.on(Events.SUBSCRIBED, async (response) => {
        if (botFirstMessage) {
            botFirstMessage = false;

            const [err, res] = await catchAsyncError(
                viberMessageRegistry.runCommandHandler({
                    text: '/start',
                    chat: {
                        ...response.userProfile,
                    },
                })
            );
            if (err) {
                logger.log(LogLevel.Error, err, LogCategory.ViberError);
            }

            return;
        }
    });

    await runSendScheduledNotificationToUsersJob(
        bot,
        viberMessageRegistry,
        viberStorage()
    );
    return true;
}
