import { Cache } from '../../../utils/cache';
import {
    Continents,
    CustomSubscriptions,
    UserMessages,
    UserRegExps,
} from '../../../models/constants';
import { InlineKeyboard, ReplyKeyboard } from 'node-telegram-keyboard-wrapper';
import { UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const getFullMenuKeyboard = (chatId): TelegramBot.SendMessageOptions => {
    const rk = new ReplyKeyboard();
    const latestSelectedCountries: Array<string> = Cache.get(
        `${chatId}_commands_country`
    );

    if (latestSelectedCountries.length > 0) {
        rk.addRow.apply(rk, latestSelectedCountries);
    }

    rk.addRow(UserMessages.CountriesData, UserMessages.AvailableCountries)
        .addRow(UserMessages.Assistant, UserMessages.GetAdviceHowToBehave)
        .addRow(UserMessages.SubscriptionManager, UserMessages.Help);

    return rk.open({ resize_keyboard: true });
};

export const getAfterCountryResponseInlineKeyboard = (
    country: string
): TelegramBot.SendMessageOptions => {
    const ik = new InlineKeyboard();
    ik.addRow({
        text: `${CustomSubscriptions.SubscribeMeOn} ${country}`,
        callback_data: `${UserRegExps.Subscribe} ${country}`,
    }).addRow({
        text: 'Show weekly chart',
        callback_data: `${UserRegExps.Trends} ${country}`,
    });

    return ik.build();
};

export const getSubscriptionMessageInlineKeyboard = (): TelegramBot.SendMessageOptions => {
    const ik = new InlineKeyboard();
    ik.addRow(
        {
            text: UserMessages.Existing,
            callback_data: `${UserMessages.Existing}`,
        },
        {
            text: UserMessages.Unsubscribe,
            callback_data: UserMessages.Unsubscribe,
        }
    );

    return ik.build();
};

export const getUnsubscribeMessageInlineKeyboard = (
    values: Array<string>
): TelegramBot.SendMessageOptions => {
    const ik = new InlineKeyboard();

    let i: number = 0;
    while (i < values.length) {
        const rows = [];
        let rowItem: number = 0;
        while (!!values[i] && rowItem < UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER) {
            rows.push({
                text: values[i],
                callback_data: `${CustomSubscriptions.UnsubscribeMeFrom} ${
                    values[i++]
                }`,
            });
            rowItem += 1;
        }
        ik.addRow(...rows);
    }

    return ik.build();
};

export const getContinentsInlineKeyboard = (): TelegramBot.SendMessageOptions => {
    const ik = new InlineKeyboard();
    ik.addRow(
        { text: Continents.Europe, callback_data: Continents.Europe },
        { text: Continents.Asia, callback_data: Continents.Asia }
    )
        .addRow(
            { text: Continents.Africa, callback_data: Continents.Africa },
            { text: Continents.Americas, callback_data: Continents.Americas }
        )
        .addRow(
            { text: Continents.Other, callback_data: Continents.Other },
            { text: Continents.Oceania, callback_data: Continents.Oceania }
        );

    return ik.build();
};

export const getHelpProposalInlineKeyboard = (): TelegramBot.SendMessageOptions => {
    const ik = new InlineKeyboard();

    ik.addRow({
        text: UserMessages.Help,
        callback_data: UserMessages.Help,
    });

    return ik.build();
};
