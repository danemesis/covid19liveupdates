import { getHelpProposalInlineKeyboard } from '../services/keyboard';
import { greetUser } from '../../../messages/userMessage';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { settingsLanguageResponse } from './settingsResponse';
import { telegramUserService } from '../services/user';
import { UserRegExps } from '../../../models/constants';

export const startResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
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
        getHelpProposalInlineKeyboard(locale)
    );
};
