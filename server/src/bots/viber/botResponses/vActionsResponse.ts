import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { getCloseActionMessage } from '../../../messages/feature/actionsMessages';
import { vGetFullMenuKeyboard } from '../services/keyboard';
import { mapBackToRealViberChatId } from '../utils/getViberChatId';
import { callToAction, greetUserMessage } from '../../../messages/userMessage';

export const vActionsResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
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
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};

export const vOnConversationStartResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
            greetUserMessage(user.settings?.locale, user) +
                '\n\n' +
                callToAction(user.settings?.locale)
        ),
    ]);
};
