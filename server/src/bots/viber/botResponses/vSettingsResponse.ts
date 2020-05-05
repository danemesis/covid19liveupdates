import { telegramUserService } from '../../telegram/services/user';
import {
    cannotSetupLanguageMessage,
    chooseLanguageMessage,
    languageHasBeenSuccessfullySetup,
    languageIsNotSupportableMessage,
} from '../../../messages/feature/settingsMessages';
import {
    getFullMenuKeyboard,
    getLocalizationInlineKeyboard,
} from '../../telegram/services/keyboard';
import { DEFAULT_LOCALE, LogCategory } from '../../../models/constants';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { viberUserService } from '../services/user';

export const vSettingsLanguageResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
    commandParameter,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const locales: Array<string> = await viberUserService.getAvailableLanguages();
    if (!commandParameter) {
        return bot.sendMessage({ id: chatId.toString() }, [
            chooseLanguageMessage(user.settings?.locale),
            getLocalizationInlineKeyboard(
                locales,
                user.settings?.locale ?? DEFAULT_LOCALE
            ),
        ]);
    }

    const availableLanguages: Array<string> = await telegramUserService().getAvailableLanguages();
    if (!availableLanguages.find((language) => language === commandParameter)) {
        return bot.sendMessage(
            chatId,
            languageIsNotSupportableMessage(user.settings?.locale),
            getLocalizationInlineKeyboard(
                locales,
                user.settings?.locale ?? DEFAULT_LOCALE
            )
        );
    }

    const [err, resultUser] = await catchAsyncError(
        telegramUserService().setUserLocale(user, commandParameter)
    );
    if (err) {
        logger.error(
            `Error occurred while setting up the language ${commandParameter} for ${chatId}`,
            err,
            LogCategory.SettingsLanguage,
            chatId
        );

        return bot.sendMessage(
            chatId,
            cannotSetupLanguageMessage(commandParameter)
        );
    }

    const updatedUser = await telegramUserService().getUser(user);
    return bot.sendMessage(
        chatId,
        // We cannot use "User" from parameter in the bot.sendMessage(
        // because that "User" still have an old locale, while this
        // "resultUser" has updated user settings
        languageHasBeenSuccessfullySetup(updatedUser.settings.locale),
        getFullMenuKeyboard(chatId, updatedUser.settings?.locale)
    );
};
