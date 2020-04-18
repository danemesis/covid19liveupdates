import {
    ApiCovid19Situation,
    CountrySituationInfo,
} from '../../../models/covid19.models';
import {
    adaptCountryToSystemRepresentation,
    getCountriesSituation,
} from '../../../services/domain/covid19';
import { Country } from '../../../models/country.models';
import {
    getMessageForCountry,
    getMessageForUserInputWithoutCountryName,
} from '../../../messages/feature/countryMessages';
import { Cache } from '../../../utils/cache';
import { flag, name } from 'country-emoji';
import { getAfterCountryResponseInlineKeyboard } from '../services/keyboard';
import { textAfterUserCommand } from '../../../utils/textAfterCommand';
import { isMessageIsCommand } from '../../../utils/incomingMessages';
import { UserRegExps } from '../../../models/constants';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const showCountryByNameStrategyResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot,
    message,
    chatId
): Promise<TelegramBot.Message> =>
    isMessageIsCommand(message.text, UserRegExps.CountryData)
        ? bot.sendMessage(chatId, getMessageForUserInputWithoutCountryName())
        : showCountryResponse(
              bot,
              adaptCountryToSystemRepresentation(
                  textAfterUserCommand(message.text)
              ),
              chatId
          );

export const showCountryByFlag: CallBackQueryHandlerWithCommandArgument = async (
    bot,
    message,
    chatId
): Promise<TelegramBot.Message> =>
    showCountryResponse(
        bot,
        adaptCountryToSystemRepresentation(name(message.text)),
        chatId
    );

// TODO: Split and move messages to /messages/feature and /domain directories
export const showCountryResponse = async (
    bot,
    requestedCountry,
    chatId
): Promise<TelegramBot.Message> => {
    if (!requestedCountry) {
        // Because of
        // [https://github.com/danbilokha/covid19liveupdates/issues/61]
        // fix of https://github.com/danbilokha/covid19liveupdates/issues/58
        // Reason, when we click on some Dashboard,
        //      MessageRegistry.registerMessageHandler this._bot.onText(
        // Regexp works not as we expect it to work
        // Theoretically should be fixed with https://github.com/danbilokha/covid19liveupdates/issues/49
        return;
    }

    const allCountriesSituations: Array<[
        Country,
        Array<CountrySituationInfo>
    ]> = await getCountriesSituation();
    const foundCountrySituations: [
        Country,
        Array<CountrySituationInfo>
    ] = allCountriesSituations.find(
        ([receivedCountry, situations]) =>
            receivedCountry.name === requestedCountry
    );
    if (
        !foundCountrySituations ||
        !foundCountrySituations?.length ||
        !foundCountrySituations[0] ||
        !foundCountrySituations[1].length
    ) {
        return bot.sendMessage(
            chatId,
            `Sorry, but I cannot find anything for ${requestedCountry}. I will save your request and will work on it`
        );
    }

    const [foundCountry, foundSituation] = foundCountrySituations;

    Cache.set(`${chatId}_commands_country`, flag(foundCountry.name));

    // TODO: Optimize!
    let totalRecovered = 0;
    let totalConfirmed = 0;
    let totalDeaths = 0;

    [foundSituation[foundSituation.length - 1]].forEach(
        ({ confirmed, deaths, recovered }: ApiCovid19Situation) => {
            totalRecovered += recovered;
            totalConfirmed += confirmed;
            totalDeaths += deaths;
        }
    );

    return bot.sendMessage(
        chatId,
        getMessageForCountry({
            name: foundCountry.name,
            confirmed: totalConfirmed,
            recovered: totalRecovered,
            deaths: totalDeaths,
            lastUpdateDate: foundSituation[foundSituation.length - 1].date,
        }),
        getAfterCountryResponseInlineKeyboard(foundCountry.name)
    );
};
