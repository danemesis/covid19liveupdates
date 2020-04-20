import { getHelpProposalInlineKeyboard } from '../services/keyboard';
import { greetUser } from '../../../messages/userMessage';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { logger } from '../../../utils/logger';
import { LogCategory } from '../../../models/constants';
import { catchAsyncError } from '../../../utils/catchError';
import { addTelegramUser, getTelegramUser } from '../services/storage';

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

    const [err, user] = await catchAsyncError(getTelegramUser(chatId));
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
            lastName: message.chat.last_name,
            startedOn: Date.now(),
        };

        const [err, result] = await catchAsyncError(addTelegramUser(newUser));
        if (err) {
            logger.error(
                `An error ocured while trying to add new user ${chatId}`,
                err,
                LogCategory.Command,
                chatId
            );
        } else {
            logger.error(
                'info',
                new Error(`New user ${newUser.chatId} was successfully added`),
                LogCategory.Command,
                chatId
            );
        }
    }

    return messageSentPromise;
};
