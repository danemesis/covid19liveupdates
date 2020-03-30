import {getChatId} from "./chat";
import {Cache} from "../../../utils/cache";
import {UserMessages} from "../../../models/constants";
import {ReplyKeyboard} from "node-telegram-keyboard-wrapper";

export const getKeyboard = (message) => {
    const rk = new ReplyKeyboard();
    const latestSelectedContries = Cache
        .get(`${getChatId(message)}_commands_country`)
    if(latestSelectedContries.length > 0){
        rk.addRow.apply(rk, latestSelectedContries);
    }

    rk
    .addRow(UserMessages.AllCountries, UserMessages.CountriesAvailable)
    .addRow(UserMessages.GetAdvicesHowToBehave)
    .addRow(UserMessages.Help);

    return rk.open({ resize_keyboard: true })
}