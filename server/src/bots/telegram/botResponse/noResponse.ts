import { noResponseForUserMessage } from '../../../messages/userMessage';
import { logger } from '../../../utils/logger';
import { getHelpProposalInlineKeyboard } from '../services/keyboard';
import { LogglyTypes } from '../../../models/loggly.models';
import * as TelegramBot from 'node-telegram-bot-api';

export const noResponse = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    //TODO: log with another severity type
    logger.error('error', message, LogglyTypes.NoSuitableResponseToUser, chatId);

    return bot.sendMessage(
        chatId,
        noResponseForUserMessage(message.text),
        getHelpProposalInlineKeyboard()
    );
};
