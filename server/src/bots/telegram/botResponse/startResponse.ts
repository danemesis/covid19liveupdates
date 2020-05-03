import { getFullMenuKeyboard } from '../services/keyboard';
import { greetUser } from '../../../messages/userMessage';
import {
    TelegramCallBackQueryHandlerWithCommandArgument,
    TelegramCallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { settingsLanguageResponse } from './settingsResponse';
import { telegramUserService } from '../services/user';
import { UserRegExps } from '../../../models/constants';

export const startResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    const locale: string | null = user.settings?.locale;
    if (!locale) {
        telegramUserService.setUserInterruptedCommand(user, UserRegExps.Start);

        return settingsLanguageResponse({
            bot,
            message,
            chatId,
            user,
        });
    }

    return bot.sendMessage(
        chatId,
        greetUser(locale, user),
        getFullMenuKeyboard(chatId, locale)
    );
};
