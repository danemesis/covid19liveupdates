import {getAvailableCountries} from '../../../services/domain/covid19';
import {Country} from '../../../models/country.models';
import {getShowCountriesMessage} from '../../../messages/feature/availableMessages';
import {CallBackQueryHandler} from '../models';

export const showAvailableCountriesResponse: CallBackQueryHandler = async (bot, message, chatId) => {
    const countries: Array<Country> = await getAvailableCountries();
    return bot.sendMessage(
        chatId,
        getShowCountriesMessage(countries),
    );
};
