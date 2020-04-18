import {
    alternativeGreetings,
    encouragingMessage,
    getCovid19ExplanationVideo,
    socialDistancing,
    suggestedBehaviors,
} from '../../../messages/feature/adviceMessages';
import { CallBackQueryHandler } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const showAdvicesHowToBehaveResponse: CallBackQueryHandler = async (
    bot,
    message,
    chatId
): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        `ℹ Suggested Behaviors for ${getCovid19ExplanationVideo()}
        ${suggestedBehaviors()} \nℹ Social Distancing
        ${socialDistancing()} \nℹ Alternative Greetings
        ${alternativeGreetings()} \n${encouragingMessage()}
        `,
        { parse_mode: 'HTML' }
    );
};
