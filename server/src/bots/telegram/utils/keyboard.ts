import {Cache} from "../../../utils/cache";
import {Continents, UserMessages} from "../../../models/constants";
import {InlineKeyboard, ReplyKeyboard} from "node-telegram-keyboard-wrapper";

export const getKeyboard = (chatId): unknown => {
    const rk = new ReplyKeyboard();
    const latestSelectedCountries = Cache
        .get(`${chatId}_commands_country`);

    if (latestSelectedCountries.length > 0) {
        rk.addRow.apply(rk, latestSelectedCountries);
    }

    rk
        .addRow(UserMessages.CountriesData, UserMessages.AvailableCountries)
        .addRow(UserMessages.Assistant, UserMessages.GetAdvicesHowToBehave)
        .addRow(UserMessages.Help);

    return rk.open({resize_keyboard: true})
};

export const getContinentsInlineKeyboard = (): unknown => {
    const ik = new InlineKeyboard();
    ik
        .addRow(
            {text: Continents.Europe, callback_data: Continents.Europe},
            {text: Continents.Asia, callback_data: Continents.Asia}
        )
        .addRow(
            {text: Continents.Africa, callback_data: Continents.Africa},
            {text: Continents.Americas, callback_data: Continents.Americas},
        )
        .addRow(
            {text: Continents.Other, callback_data: Continents.Other},
            {text: Continents.Oceania, callback_data: Continents.Oceania},
        );

    return ik.build();
};
