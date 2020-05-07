import { Express } from 'express';
import { Bot, Events } from 'viber-bot';
import { logger } from '../../utils/logger';
import {
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
import { noResponse } from '../telegram/botResponse/noResponse';
import { vActionsResponse } from './botResponses/vActionsResponse';
import { vSettingsLanguageResponse } from './botResponses/vSettingsResponse';
import { vHelpResponse } from './botResponses/vHelpResponse';

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
                noResponse
            )
        )
        // Actions
        .registerMessageHandler([UserActionsRegExps.Close], vActionsResponse);

    bot.on(Events.MESSAGE_RECEIVED, (message, response) => {
        // console.log('message MESSAGE_RECEIVED', message, response);
        // response.send(new Message.Text('Hi ' + message.text));
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
