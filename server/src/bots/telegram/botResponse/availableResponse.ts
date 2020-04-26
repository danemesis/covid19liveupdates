import { getAvailableCountries } from '../../../services/domain/covid19';
import { Country } from '../../../models/country.models';
import { getShowCountriesMessage } from '../../../messages/feature/availableMessages';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const showAvailableCountriesResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    const countries: Array<Country> = await getAvailableCountries();
    return bot.sendMessage(chatId, getShowCountriesMessage(countries));
};
