import { getLocalizedMessage } from '../../services/domain/localization.service';

export const chooseLanguageMessage = (locale: string): string =>
    getLocalizedMessage(locale, ['Choose language']).join();

export const languageIsNotSupportableMessage = (
    locale: string | null
): string =>
    getLocalizedMessage(locale, [
        'Language is not supported 😔',
        '. Choose from the list',
    ]).join();

export const cannotSetupLanguageMessage = (locale: string): string =>
    getLocalizedMessage(locale, [
        `Sorry, I cannot setup the ${locale} for you. I am really sorry  🙇🏽`,
        `. Probably my database is out of reach. Try latter`,
    ]).join();

export const languageHasBeenSuccessfullySetup = (
    locale: string | null
): string =>
    getLocalizedMessage(locale, [
        `Language has been successfully installed 👌`,
    ]).join();
