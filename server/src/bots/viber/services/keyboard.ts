import { Keyboard, KeyboardButton } from '../models';
import { Cache } from '../../../services/domain/cache';
import { getLocalizedMessages } from '../../../services/domain/localization.service';
import {
    Emojii,
    UserActionsRegExps,
    UserInlineActions,
    UserMessages,
    UserSettingsRegExps,
} from '../../../models/constants';
import { UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER } from '../../telegram/models';

export const vGetFullMenuKeyboard = (
    locale: string,
    chatId: string
): Keyboard => {
    const keyboard: Keyboard = {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [],
    };

    const latestSelectedCountries: Array<string> = Cache.get(
        `${chatId}_commands_country`
    );

    if (latestSelectedCountries.length > 0) {
        keyboard.Buttons.push(...getCountriesButtons(latestSelectedCountries));
    }

    keyboard.Buttons.push(
        {
            ActionType: 'reply',
            ActionBody: UserMessages.CountriesData,
            Columns: 3,
            Rows: 1,
            Text: getLocalizedMessages(locale, UserMessages.CountriesData),
        },
        {
            ActionType: 'reply',
            ActionBody: UserMessages.SubscriptionManager,
            Columns: 3,
            Rows: 1,
            Text: getLocalizedMessages(
                locale,
                UserMessages.SubscriptionManager
            ),
        },
        {
            ActionType: 'reply',
            ActionBody: UserMessages.Assistant,
            Columns: 3,
            Rows: 1,
            Text: getLocalizedMessages(locale, UserMessages.Assistant),
        },
        {
            ActionType: 'reply',
            ActionBody: UserMessages.GetAdviceHowToBehave,
            Columns: 3,
            Rows: 1,
            Text: getLocalizedMessages(
                locale,
                UserMessages.GetAdviceHowToBehave
            ),
        },
        {
            ActionType: 'reply',
            ActionBody: UserMessages.Language,
            Columns: 3,
            Rows: 1,
            Text: getLocalizedMessages(locale, UserMessages.Language),
        },
        {
            ActionType: 'reply',
            ActionBody: UserMessages.Help,
            Columns: 3,
            Rows: 1,
            Text: getLocalizedMessages(locale, UserMessages.Help),
        }
    );

    return keyboard;
};

export const vGetLocalizationInlineKeyboard = (
    locales: Array<string>,
    currentLocale: string
): Keyboard => {
    const keyboard: Keyboard = {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [getCloseInlineKeyboardRow(currentLocale)],
    };

    let i: number = 0;
    while (i < locales.length) {
        const rows = [];
        let rowItem: number = 0;
        while (!!locales[i] && rowItem < UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER) {
            const text =
                currentLocale === locales[i]
                    ? `${locales[i]} ${Emojii.Check}`
                    : locales[i];
            const callbackData = `${UserSettingsRegExps.Language} ${
                locales[i++]
            }`;
            const button: KeyboardButton = {
                ActionType: 'reply',
                ActionBody: callbackData,
                Columns: 1,
                Rows: 1,
                Text: text,
            };
            rows.push(buttong);
            rowItem += 1;
        }

        keyboard.Buttons.push(...rows);
    }

    return keyboard;
};

const getCountriesButtons = (
    countries: Array<string>
): Array<KeyboardButton> => {
    return countries.map((country) => ({
        ActionType: 'reply',
        ActionBody: country,
        Columns: 2,
        Rows: 1,
        Text: country,
    }));
};

export const vGetHelpProposalInlineKeyboard = (locale: string): Keyboard => ({
    Type: 'keyboard',
    Revision: 1,
    Buttons: [
        {
            ActionType: 'reply',
            ActionBody: getLocalizedMessages(locale, UserMessages.Help),
            Columns: 1,
            Rows: 1,
            Text: getLocalizedMessages(locale, UserMessages.Help),
        },
    ],
});

const getCloseInlineKeyboardRow = (locale: string): KeyboardButton => {
    return {
        ActionType: 'reply',
        ActionBody: UserActionsRegExps.Close,
        Columns: 1,
        Rows: 1,
        Text: getLocalizedMessages(locale, UserInlineActions.Close),
    };
};
