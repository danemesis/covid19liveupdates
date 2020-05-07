import { LogCategory } from '../../../models/constants';
import { logger } from '../../../utils/logger';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { vGetHelpProposalInlineKeyboard } from '../services/keyboard';
import { noResponseForUserMessage } from '../../../messages/userMessage';

export const vNoResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    message,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    // TODO: log with another severity type
    logger.error(
        'error',
        new Error(
            `We have no response for a user ${chatId} for ${message.text}.`
        ),
        LogCategory.NoSuitableResponseToUser,
        chatId
    );

    return bot.sendMessage({ id: chatId }, [
        // We cannot use "User" from parameter in the bot.sendMessage(
        // because that "User" still have an old locale, while this
        // "resultUser" has updated user settings
        new Message.Text(
            noResponseForUserMessage(user?.settings?.locale, message.text)
        ),
        new Message.Keyboard(
            vGetHelpProposalInlineKeyboard(user.settings?.locale)
        ),
    ]);
};
