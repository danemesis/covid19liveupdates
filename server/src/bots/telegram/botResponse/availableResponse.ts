import { getAvailableCountries } from '../../../services/domain/covid19';
import { Country } from '../../../models/country.models';
import { getShowCountriesMessage } from '../../../messages/feature/availableMessages';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const showAvailableCountriesResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    const countries: Array<Country> = await getAvailableCountries();
    return bot.sendMessage(chatId, getShowCountriesMessage(countries));
};
