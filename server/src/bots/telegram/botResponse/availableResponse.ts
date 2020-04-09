import {getAvailableCountries} from "../../../services/domain/covid19";
import {Country} from "../../../models/country.models";
import {getShowCountriesMessage} from "../../../messages/feature/availableMessages";

export const showAvailableCountriesResponse = (bot, message, chatId) => {
    getAvailableCountries()
        .then((countries: Array<Country>) => {
                bot.sendMessage(
                    chatId,
                    getShowCountriesMessage(countries),
                );
            }
        )
};
