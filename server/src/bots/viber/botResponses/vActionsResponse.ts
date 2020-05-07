import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { getCloseActionMessage } from '../../../messages/feature/actionsMessages';
import { vGetFullMenuKeyboard } from '../services/keyboard';

export const vActionsResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: chatId }, [
        new Message.Text(getCloseActionMessage(user.settings?.locale)),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};

export const vMainMenuResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: chatId }, [
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};
