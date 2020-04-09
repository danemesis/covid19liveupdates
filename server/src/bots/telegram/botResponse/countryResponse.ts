import {ApiCovid19Situation, CountrySituationInfo} from "../../../models/covid19.models";
import {adaptCountryToSystemRepresentation, getCountriesSituation} from "../../../services/domain/covid19";
import {Country} from "../../../models/country.models";
import {
    getMessageForCountry,
    getMessageForUserInputWithoutCountryName
} from "../../../messages/feature/countryMessages";
import {Cache} from "../../../utils/cache";
import {flag, name} from 'country-emoji';
import {getKeyboard} from '../utils/keyboard';
import {textAfterUserCommand} from "../../../utils/textAfterCommand";
import {isMessageIsCommand} from "../../../utils/incomingMessages";
import {UserRegExps} from "../../../models/constants";

export const showCountryByNameResponse = async (bot, message, chatId): Promise<void> =>
    isMessageIsCommand(message.text, UserRegExps.CountryData)
        ? bot.sendMessage(chatId, getMessageForUserInputWithoutCountryName())
        : showCountry(
            bot,
        chatId,
        adaptCountryToSystemRepresentation(textAfterUserCommand(message.text))
        );

export const showCountryByFlag = async (bot, message, chatId): Promise<void> =>
    showCountry(
        bot,
        chatId,
        name(message.text)
    );

// TODO: Move messages to /messages/feature directory
const showCountry = async (bot, chatId, requestedCountry): Promise<void> => {
    const allCountries: Array<[Country, Array<CountrySituationInfo>]> = await getCountriesSituation();
    const foundCountrySituations: [Country, Array<CountrySituationInfo>] = allCountries
        .find(([receivedCountry, situations]) => receivedCountry.name === requestedCountry);
    const [foundCountry, foundSituation] = foundCountrySituations;

    if (!foundCountry || !foundSituation?.length) {
        bot.sendMessage(
            chatId,
            `Sorry, but I cannot find anything for ${requestedCountry}. I will save your request and will work on it`
        );
        return;
    }

    Cache.set(`${chatId}_commands_country`, flag(foundCountry.name));

    // TODO: Optimize!
    let totalRecovered = 0;
    let totalConfirmed = 0;
    let totalDeaths = 0;

    [foundSituation[foundSituation.length - 1]].forEach(({confirmed, deaths, recovered}: ApiCovid19Situation) => {
        totalRecovered += recovered;
        totalConfirmed += confirmed;
        totalDeaths += deaths;
    });

    bot.sendMessage(
        chatId,
        getMessageForCountry({
            name: foundCountry.name,
            confirmed: totalConfirmed,
            recovered: totalRecovered,
            deaths: totalDeaths,
            lastUpdateDate: foundSituation[foundSituation.length - 1].date
        }),
        getKeyboard(chatId)
    );
}