import { getHelpProposalInlineKeyboard } from '../services/keyboard';
import { greetUser } from '../../../messages/userMessage';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { telegramStorage } from '../services/storage';
import { logger } from '../../../utils/logger';
import { LogCategory } from '../../../models/constants';
import { catchAsyncError } from '../../../utils/catchError';

export const startResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    const messageSentPromise = bot.sendMessage(
        chatId,
        `${greetUser(message.from)}`,
        getHelpProposalInlineKeyboard()
    );

    const [err, user] = await catchAsyncError(telegramStorage.getUser(chatId));
    if (err) {
        logger.error(
            `Error while trying to get user ${chatId} from db`,
            err,
            LogCategory.Command,
            chatId
        );
    }

    if (!err && (!user || Object.keys(user).length === 0)) {
        const newUser = {
            chatId,
            userName: message.chat.username || '',
            firstName: message.chat.first_name || '',
            lastName: message.chat.last_name || '',
            startedOn: Date.now(),
        };

        const [err, result] = await catchAsyncError(
            telegramStorage.addUser(newUser)
        );
        if (err) {
            logger.error(
                `An error occurred while trying to add new user ${chatId}`,
                err,
                LogCategory.Command,
                chatId
            );
        } else {
            logger.log(
                'info',
                `New user ${newUser.chatId} was successfully added`,
                LogCategory.Command,
                chatId
            );
        }
    }

    return messageSentPromise;
};
