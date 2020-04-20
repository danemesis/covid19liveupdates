import { getHelpProposalInlineKeyboard } from '../services/keyboard';
import { greetUser } from '../../../messages/userMessage';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getUser, addUser } from '../../../services/domain/user'
import { logger } from '../../../utils/logger';
import { LogglyTypes } from '../../../models/loggly.models';
import { catchAsyncError } from '../../../utils/catchError';

export const startResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {

    let messageSentPromise =
        bot.sendMessage(
            chatId,
            `${greetUser(message.from)}`,
            getHelpProposalInlineKeyboard()
        );
        
    let [err, user] = await catchAsyncError(getUser(chatId));
    if(err){
        logger.error(`Error while trying to get user ${chatId} from db`
            , err
            , LogglyTypes.Command
            , chatId);
    }

    if (!err && (!user || Object.keys(user).length === 0 )) {
        user = {
            chatId,
            userName: message.chat.username || '',
            firstName: message.chat.first_name || '',
            lastName: message.chat.last_name,
            startedOn: Date.now()
        };

        const [err, result]  = await catchAsyncError(addUser(user));
        if(err){
            logger.error(`An error ocured while trying to add new user ${chatId}`
            , err
            , LogglyTypes.Command
            , chatId);
        }
        else {
            logger.log('info', `New user ${user.chatId} was successfully added`
            , LogglyTypes.Command
            , chatId);
        }
        return messageSentPromise;
    }
};
