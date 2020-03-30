import {getChatId} from "../utils/chat";
import {ApiCovid19Situation, CountrySituationInfo} from "../../../models/covid19";
import {
    adaptCountryToSystemRepresentation,
    getAvailableCountries,
    getCountriesSituation
} from "../../../services/domain/covid19";
import {Country} from "../../../models/country";
import {getMessageForCountry, getShowCountriesMessage} from "../../../utils/messages/countryMessage";
import {Cache} from "../../../utils/cache";
import {flag, name} from 'country-emoji';
import {getKeyboard} from '../utils/keyboard';
import {textAfterUserCommand} from "../../../utils/textAfterCommand";

export const showCountries = (bot, message) => {
    getAvailableCountries()
        .then((countries: Array<Country>) => {
                bot.sendMessage(
                    getChatId(message),
                    getShowCountriesMessage(countries),
                );
            }
        )
};

export const showCountryByName = async (bot, message): Promise<void> =>
    showCountry(bot, message, adaptCountryToSystemRepresentation(textAfterUserCommand(message.text)));

export const showCountryByFlag = async (bot, message): Promise<void> =>
    showCountry(bot, message, name(message.text));

const showCountry = async (bot, message, requestedCountry): Promise<void> => {
    const allCountries: Array<[Country, Array<CountrySituationInfo>]> = await getCountriesSituation();
    const foundCountrySituations: [Country, Array<CountrySituationInfo>] = allCountries
        .find(([receivedCountry, situations]) => receivedCountry.name === requestedCountry);
    const [foundCountry, foundSituation] = foundCountrySituations;

    if (!foundCountry || !foundSituation?.length) {
        bot.sendMessage(
            getChatId(message),
            `Sorry, but I cannot find anything for ${requestedCountry}. I will save your request and will work on it`
        );
        return;
    }

    Cache.set(`${getChatId(message)}_commands_country`, flag(foundCountry.name));

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
        getChatId(message),
        getMessageForCountry({
            countryName: foundCountry.name,
            totalConfirmed,
            totalRecovered,
            totalDeaths,
            lastUpdateDate: foundSituation[foundSituation.length - 1].date
        }),
        getKeyboard(message)
    );
}