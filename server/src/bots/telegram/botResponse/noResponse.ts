import {noResponseForUserMessage} from '../../../messages/userMessage';
import {TelegramMessage} from '../models';
import {logger} from '../../../utils/logger';
import {getHelpProposalInlineKeyboard} from '../services/keyboard';
import {LogglyTypes} from '../../../models/loggly.models';

export const noResponse = async (bot, message: TelegramMessage, chatId: number): Promise<void> => {
    logger.log(
        'error',
        {
            ...message,
            type: LogglyTypes.NoSuitableResponseToUser,
        }
    );

    return bot.sendMessage(
        chatId,
        noResponseForUserMessage(message.text),
        getHelpProposalInlineKeyboard()
    );
};
