import { greetUserMessage } from '../../../messages/userMessage';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { vGetFullMenuKeyboard } from '../services/keyboard';
import { viberUserService } from '../services/user';
import { vSettingsLanguageResponse } from './vSettingsResponse';
import { UserRegExps } from '../../../models/constants';

export const vStartResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const locale: string | null = user.settings?.locale;
    if (!locale) {
        viberUserService().setUserInterruptedCommand(user, UserRegExps.Start);

        return vSettingsLanguageResponse({
            bot,
            message,
            chatId,
            user,
        });
    }

    return bot.sendMessage({ id: chatId }, [
        new Message.Text(greetUserMessage(locale, user)),
        new Message.Keyboard(vGetFullMenuKeyboard(locale, chatId)),
    ]);
};
