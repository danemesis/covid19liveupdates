import {getChatId} from "./chat";
import {Cache} from "../../../utils/cache";
import {UserMessages} from "../../../models/constants";
import {ReplyKeyboard} from "node-telegram-keyboard-wrapper";

export const getKeyboard = (message): unknown => {
    const rk = new ReplyKeyboard();
    const latestSelectedCountries = Cache
        .get(`${getChatId(message)}_commands_country`);

    if (latestSelectedCountries.length > 0) {
        rk.addRow.apply(rk, latestSelectedCountries);
    }

    rk
        .addRow(UserMessages.AllCountries, UserMessages.CountriesAvailable)
        .addRow(UserMessages.Assistant, UserMessages.GetAdvicesHowToBehave)
        .addRow(UserMessages.Help);

    return rk.open({resize_keyboard: true})
}