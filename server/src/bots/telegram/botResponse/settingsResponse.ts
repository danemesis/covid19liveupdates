import { getLocalizationInlineKeyboard } from '../services/keyboard';
import { CallBackQueryHandlerWithCommandArgument, CallBackQueryParameters } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getLocalizedMessage } from '../../../services/domain/localization.service';
import {
    cannotSetupLanguageMessage,
    chooseLanguageMessage,
    languageHasBeenSuccessfullySetup,
    languageIsNotSupportableMessage,
} from '../../../messages/feature/settingsMessages';
import { telegramUserService } from '../services/user';
import { logger } from '../../../utils/logger';
import { DEFAULT_LOCALE, LogCategory } from '../../../models/constants';
import { catchAsyncError } from '../../../utils/catchError';

export const settingsLanguageResponse: CallBackQueryHandlerWithCommandArgument = async ({
                                                                                            bot,
                                                                                            message,
                                                                                            chatId,
                                                                                            user,
                                                                                            commandParameter,
                                                                                        }: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    const locales: Array<string> = await telegramUserService.getAvailableLanguages();
    if (!commandParameter) {
        return bot.sendMessage(
            chatId,
            getLocalizedMessage(
                user.settings?.locale,
                [chooseLanguageMessage()],
            ),
            getLocalizationInlineKeyboard(
                locales,
                user.settings?.locale ?? DEFAULT_LOCALE,
            ),
        );
    }

    const availableLanguages: Array<string> = await telegramUserService.getAvailableLanguages();
    if (!availableLanguages.find(language => language === commandParameter)) {
        return bot.sendMessage(
            chatId,
            getLocalizedMessage(
                user.settings?.locale,
                languageIsNotSupportableMessage(),
            ),
            getLocalizationInlineKeyboard(
                locales,
                user.settings?.locale ?? DEFAULT_LOCALE,
            ),
        );
    }

    const [err, result] = await catchAsyncError(
        telegramUserService.setUserLocale(user, commandParameter),
    );
    if (err) {
        logger.error(
            `Error occurred while setting up the language ${commandParameter} for ${chatId}`,
            err,
            LogCategory.SettingsLanguage,
            chatId,
        );

        return bot.sendMessage(
            chatId,
            cannotSetupLanguageMessage(commandParameter).join(''),
        );
    }

    return bot.sendMessage(
        chatId,
        getLocalizedMessage(
            user.settings?.locale,
            [languageHasBeenSuccessfullySetup()],
        ),
    );
};
