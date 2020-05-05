import { greetUserMessage } from '../../../messages/userMessage';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';

export const vStartResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const locale: string | null = user.settings?.locale;
    // if (!locale) {
    //     viberUserService.setUserInterruptedCommand(user, UserRegExps.Start);
    //
    //     return settingsLanguageResponse({
    //         bot,
    //         message,
    //         chatId,
    //         user,
    //     });
    // }

    return bot.sendMessage({ id: chatId }, [
        new Message.Text(greetUserMessage(locale, user)),
        // getFullMenuKeyboard(chatId, locale),
    ]);
};
