import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { vGetFullMenuKeyboard } from '../services/keyboard';
import { getHelpMessage } from '../../../messages/feature/helpMessages';
import { mapBackToRealViberChatId } from '../utils/getViberChatId';

export const vHelpResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    message,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(getHelpMessage(user?.settings?.locale)),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};
