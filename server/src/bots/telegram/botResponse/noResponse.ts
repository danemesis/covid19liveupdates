import { noResponseForUserMessage } from '../../../messages/userMessage';
import { logger } from '../../../utils/logger';
import { getHelpProposalInlineKeyboard } from '../services/keyboard';
import { LogCategory } from '../../../models/constants';
import * as TelegramBot from 'node-telegram-bot-api';

export const noResponse = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    // TODO: log with another severity type
    logger.log(
        'error',
        `We have no response for user ${chatId} for ${message.text} ... plak.. plak..`,
        LogCategory.NoSuitableResponseToUser,
        chatId
    );

    return bot.sendMessage(
        chatId,
        noResponseForUserMessage(message.text),
        getHelpProposalInlineKeyboard()
    );
};
