import { telegramUserService } from '../../telegram/services/user';
import {
    cannotSetupLanguageMessage,
    chooseLanguageMessage,
    languageHasBeenSuccessfullySetup,
    languageIsNotSupportableMessage,
} from '../../../messages/feature/settingsMessages';
import { DEFAULT_LOCALE, LogCategory } from '../../../models/constants';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { viberUserService } from '../services/user';
import {
    vGetFullMenuKeyboard,
    vGetLocalizationInlineKeyboard,
} from '../services/keyboard';

export const vSettingsLanguageResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
    commandParameter,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const locales: Array<string> = await viberUserService().getAvailableLanguages();
    if (!commandParameter) {
        return bot.sendMessage({ id: chatId }, [
            new Message.Text(chooseLanguageMessage(user.settings?.locale)),
            new Message.Keyboard(
                vGetLocalizationInlineKeyboard(
                    locales,
                    user.settings?.locale ?? DEFAULT_LOCALE
                )
            ),
        ]);
    }

    const availableLanguages: Array<string> = await telegramUserService().getAvailableLanguages();
    if (!availableLanguages.find((language) => language === commandParameter)) {
        return bot.sendMessage({ id: chatId }, [
            new Message.Text(
                languageIsNotSupportableMessage(user.settings?.locale)
            ),
            new Message.Keyboard(
                vGetLocalizationInlineKeyboard(
                    locales,
                    user.settings?.locale ?? DEFAULT_LOCALE
                )
            ),
        ]);
    }

    const [err, resultUser] = await catchAsyncError(
        viberUserService().setUserLocale(user, commandParameter)
    );
    if (err) {
        logger.error(
            `Error occurred while setting up the language ${commandParameter} for ${chatId}`,
            err,
            LogCategory.SettingsLanguage,
            chatId
        );

        return bot.sendMessage({ id: chatId }, [
            new Message.Text(cannotSetupLanguageMessage(commandParameter)),
        ]);
    }

    const updatedUser = await viberUserService().getUser(user);
    return bot.sendMessage({ id: chatId }, [
        // We cannot use "User" from parameter in the bot.sendMessage(
        // because that "User" still have an old locale, while this
        // "resultUser" has updated user settings
        new Message.Text(
            languageHasBeenSuccessfullySetup(updatedUser.settings.locale)
        ),
        new Message.Keyboard(
            vGetFullMenuKeyboard(chatId, updatedUser.settings?.locale)
        ),
    ]);
};
