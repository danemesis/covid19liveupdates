import {getChatId} from "./chat";
import {Cache} from "../../../utils/cache";
import {UserMessages} from "../../../models/constants";

const KeyboardWrapper = require("node-telegram-keyboard-wrapper");

export const getKeyboard = (message) => {
    const rk = new KeyboardWrapper.ReplyKeyboard();
    const country = Cache.get(`${getChatId(message)}_commands_country`);
    if(country){
        const {command, display} = country;
        if(command && display){
            console.log(command);
            console.log(display);
            rk.addRow({ text: display, callback_data: command });
        }
    }

    rk
    .addRow(UserMessages.AllCountries, UserMessages.CountriesAvailable)
    .addRow(UserMessages.GetAdvicesHowToBehave)
    .addRow(UserMessages.Help);

    return rk.open({ resize_keyboard: true })
}