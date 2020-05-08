import {
    Keyboard,
    KeyboardButton,
    VIBER_COUNTRIES_ROW_ITEMS_NUMBER,
    VIBER_UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER,
    ViberUserMessages,
} from '../models';
import { getLocalizedMessages } from '../../../services/domain/localization.service';
import {
    Continents,
    CustomSubscriptions,
    Emojii,
    Frequency,
    UserActionsRegExps,
    UserInlineActions,
    UserMessages,
    UserRegExps,
    UserSettingsRegExps,
} from '../../../models/constants';
import { Country } from '../../../models/country.models';
import { flag } from 'country-emoji';

export const vGetFullMenuKeyboard = (
    locale: string,
    chatId: string
): Keyboard => {
    const keyboard: Keyboard = {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [],
    };

    // const latestSelectedCountries: Array<string> = Cache.get(
    //     `${chatId}_commands_country`,
    // );
    //
    // if (latestSelectedCountries.length > 0) {
    //     keyboard.Buttons.push(...getCountriesButtons(latestSelectedCountries));
    // }

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

export const vGetAfterCountryResponseInlineKeyboard = (
    country: string,
    locale: string
): Keyboard => {
    return {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [
            {
                ActionType: 'reply',
                ActionBody: `${getLocalizedMessages(locale, [
                    UserRegExps.Subscribe,
                ])} ${country}`,
                Columns: 6,
                Rows: 1,
                Text: `${getLocalizedMessages(locale, [
                    CustomSubscriptions.SubscribeMeOn,
                ])} ${country}`,
            },
            {
                ActionType: 'reply',
                ActionBody: `${UserRegExps.Trends} ${country}`,
                Columns: 2,
                Rows: 1,
                Text: getLocalizedMessages(locale, 'Weekly chart'),
            },
            {
                ActionType: 'reply',
                ActionBody: `${UserRegExps.Trends} \"${country}\" ${Frequency.Monthly}`,
                Columns: 2,
                Rows: 1,
                Text: getLocalizedMessages(locale, 'Monthly chart'),
            },
            {
                ActionType: 'reply',
                ActionBody: `${UserRegExps.Trends} \"${country}\" ${Frequency.WholePeriod}`,
                Columns: 2,
                Rows: 1,
                Text: getLocalizedMessages(locale, 'Whole period chart'),
            },
            {
                ActionType: 'reply',
                ActionBody: ViberUserMessages.MainMenu,
                Columns: 6,
                Rows: 1,
                Text: getLocalizedMessages(locale, ViberUserMessages.MainMenu),
            },
        ],
    };
};

export const vGetSubscriptionMessageInlineKeyboard = (
    locale: string
): Keyboard => {
    return {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [
            {
                ActionType: 'reply',
                ActionBody: UserMessages.Existing,
                Columns: 3,
                Rows: 1,
                Text: getLocalizedMessages(locale, UserMessages.Existing),
            },
            {
                ActionType: 'reply',
                ActionBody: UserMessages.Unsubscribe,
                Columns: 3,
                Rows: 1,
                Text: getLocalizedMessages(locale, UserMessages.Unsubscribe),
            },
            vGetMainMenuKeyboardRow(locale, 6),
        ],
    };
};

export const vGetUnsubscribeMessageInlineKeyboard = (
    locale: string | null,
    values: Array<string>
): Keyboard => {
    const keyboard: Keyboard = {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [],
    };

    let i: number = 0;
    while (i < values.length) {
        const rows = [];
        let rowItem: number = 0;
        while (
            !!values[i] &&
            rowItem < VIBER_UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER
        ) {
            const button: KeyboardButton = {
                ActionType: 'reply',
                ActionBody: `${CustomSubscriptions.UnsubscribeMeFrom} ${values[i]}`,
                Columns: 2,
                Rows: 1,
                Text: values[i],
            };
            rows.push(button);
            rowItem += 1;
            i += 1;
        }
        keyboard.Buttons.push(...rows);
    }

    keyboard.Buttons.push(vGetMainMenuKeyboardRow(locale, 6));

    return keyboard;
};

export const vGetLocalizationInlineKeyboard = (
    locales: Array<string>,
    currentLocale: string
): Keyboard => {
    const keyboard: Keyboard = {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [],
    };

    let i: number = 0;
    while (i < locales.length) {
        const rows = [];
        let rowItem: number = 0;
        while (
            !!locales[i] &&
            rowItem < VIBER_UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER
        ) {
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
                Columns: 3,
                Rows: 1,
                Text: text,
            };
            rows.push(button);
            rowItem += 1;
        }

        keyboard.Buttons.push(...rows);
    }

    keyboard.Buttons.push(getCloseInlineKeyboardRow(currentLocale));

    return keyboard;
};

export const vGetContinentCountriesCheckOutOfferMessageInlineKeyboard = (
    locale: string,
    continent: string
): Keyboard => {
    return {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [
            {
                ActionType: 'reply',
                ActionBody: UserRegExps.CountriesData,
                Columns: 3,
                Rows: 1,
                Text: getLocalizedMessages(locale, 'Get all continents'),
            },
            {
                ActionType: 'reply',
                ActionBody: `${UserRegExps.CountriesData} ${continent}`,
                Columns: 3,
                Rows: 1,
                Text: getLocalizedMessages(locale, [
                    [`Check %s countries out`, continent],
                ]).join(''),
            },
            vGetMainMenuKeyboardRow(locale, 6),
        ],
    };
};

export const vGetCountriesInlineKeyboard = (
    countries: Array<Country>
): Keyboard => {
    const keyboard: Keyboard = {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [],
    };

    let i: number = 0;
    while (i < countries.length) {
        const rows = [];
        let rowItem: number = 0;
        while (!!countries[i] && rowItem < VIBER_COUNTRIES_ROW_ITEMS_NUMBER) {
            const country: Country = countries[i];
            const countryButton: KeyboardButton = {
                ActionType: 'reply',
                ActionBody: `${UserRegExps.CountryData} ${country.name}`,
                Columns: 1,
                Rows: 1,
                Text: `${flag(country.name) ?? ''}${country.iso3}`,
            };
            rows.push(countryButton);
            i += 1;
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

export const getContinentsInlineKeyboard = (): Keyboard => {
    return {
        Type: 'keyboard',
        Revision: 1,
        Buttons: [
            {
                ActionType: 'reply',
                ActionBody: Continents.Europe,
                Columns: 2,
                Rows: 1,
                Text: Continents.Europe,
            },
            {
                ActionType: 'reply',
                ActionBody: Continents.Asia,
                Columns: 2,
                Rows: 1,
                Text: Continents.Asia,
            },
            {
                ActionType: 'reply',
                ActionBody: Continents.Africa,
                Columns: 2,
                Rows: 1,
                Text: Continents.Africa,
            },
            {
                ActionType: 'reply',
                ActionBody: Continents.Americas,
                Columns: 2,
                Rows: 1,
                Text: Continents.Americas,
            },
            {
                ActionType: 'reply',
                ActionBody: Continents.Other,
                Columns: 2,
                Rows: 1,
                Text: Continents.Other,
            },
            {
                ActionType: 'reply',
                ActionBody: Continents.Oceania,
                Columns: 2,
                Rows: 1,
                Text: Continents.Oceania,
            },
        ],
    };
};

export const vGetHelpProposalInlineKeyboard = (locale: string): Keyboard => ({
    Type: 'keyboard',
    Revision: 1,
    Buttons: [
        {
            ActionType: 'reply',
            ActionBody: getLocalizedMessages(locale, UserMessages.Help),
            Columns: 6,
            Rows: 1,
            Text: getLocalizedMessages(locale, UserMessages.Help),
        },
        {
            ActionType: 'reply',
            ActionBody: ViberUserMessages.MainMenu,
            Columns: 6,
            Rows: 1,
            Text: getLocalizedMessages(locale, ViberUserMessages.MainMenu),
        },
    ],
});

const vGetMainMenuKeyboardRow = (
    locale: string,
    columns: number = 6
): KeyboardButton => ({
    ActionType: 'reply',
    ActionBody: ViberUserMessages.MainMenu,
    Columns: columns,
    Rows: 1,
    Text: getLocalizedMessages(locale, ViberUserMessages.MainMenu),
});

const getCloseInlineKeyboardRow = (locale: string): KeyboardButton => {
    return {
        ActionType: 'reply',
        ActionBody: UserActionsRegExps.Close,
        Columns: 6,
        Rows: 1,
        Text: getLocalizedMessages(locale, UserInlineActions.Close),
    };
};
