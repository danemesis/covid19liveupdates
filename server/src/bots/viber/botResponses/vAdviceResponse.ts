import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { getAdviceMessage } from '../../../messages/feature/adviceMessages';
import { vGetFullMenuKeyboard } from '../services/keyboard';
import { mapBackToRealViberChatId } from '../utils/getViberChatId';

export const vAdviceResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(getAdviceMessage(user.settings?.locale)),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};
