import {getChatId} from "./chat";
import {Cache} from "../../../utils/cache";
import {UserMessages} from "../../../models/constants";

const KeyboardWrapper = require("node-telegram-keyboard-wrapper");

export const getKeyboard = (message) => {
    const rk = new KeyboardWrapper.ReplyKeyboard();
    const contrySelected = Cache.get(`${getChatId(message)}_country`);
    if(contrySelected){
        rk.addRow(contrySelected);
    }

    rk
    .addRow(UserMessages.AllCountries, UserMessages.CountriesAvailable)
    .addRow(UserMessages.GetAdvicesHowToBehave)
    .addRow(UserMessages.Help);

    return rk.open({ resize_keyboard: true })
}