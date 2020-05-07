import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { getAdviceMessage } from '../../../messages/feature/adviceMessages';
import { vGetFullMenuKeyboard } from '../services/keyboard';

export const vAdviceResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: chatId }, [
        new Message.Text(getAdviceMessage(user.settings?.locale)),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};
