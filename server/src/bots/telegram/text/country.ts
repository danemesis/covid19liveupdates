import {getChatId} from "../utils/chat";
import {getAvailableCountries, getCountriesSituation} from "../../../api/covid19";
import {Situation} from "../../../models/covid";
import {getMessageForCountry} from "../utils/covid19";
import {getCountryNameFormat} from "../utils/country";
import {UpperCaseString} from "../../../models/tsTypes";

const EXPLANATION_MESSAGE: string = 'To check country use: "/country [COUNTRY NAME]" template (Not case sensative)';

export const showCountries = (bot, message) => {
    getAvailableCountries()
        .then((countries: Array<UpperCaseString>) => countries.map(getCountryNameFormat))
        .then((countries: Array<string>) => {
                bot.sendMessage(
                    getChatId(message),
                    `Available ${countries.length} countries. \n\n`
                        .concat(countries.join('; '))
                        .concat(`\n\n${EXPLANATION_MESSAGE}, \n\ni.e. /country ${countries[0]}`)
                );
            }
        )
};

const getCountryFromMessage = (userTextCode): string => userTextCode.slice(userTextCode.indexOf(' ')).trim();

export const showCountry = async (bot, message): Promise<void> => {
    const requestedCountry: string = getCountryFromMessage(message.text).toLocaleUpperCase();
    const country = [...await getAvailableCountries()]
        .find(country => country === requestedCountry);

    if (!country) {
        bot.sendMessage(
            getChatId(message),
            `Cannot find data for ${getCountryNameFormat(requestedCountry)}`
        );
        return;
    }

    const allCountries: Array<[string, Array<Situation>]> = await getCountriesSituation();
    const foundCountrySituations: [string, Array<Situation>] = allCountries
        .find(([receivedCountry, situations]) => receivedCountry === country);

    if (!foundCountrySituations?.length) {
        bot.sendMessage(
            getChatId(message),
            `Cannot find data for ${getCountryNameFormat(requestedCountry)}`
        );
        return;
    }

    const [foundCountry, foundSituations] = foundCountrySituations;

    let totalRecovered = 0;
    let totalConfirmed = 0;
    let totalDeaths = 0;

    [foundSituations[foundSituations.length - 1]].forEach(({confirmed, deaths, recovered}: Situation) => {
        totalRecovered += recovered;
        totalConfirmed += confirmed;
        totalDeaths += deaths;
    });

    bot.sendMessage(
        getChatId(message),
        getMessageForCountry(
            getCountryNameFormat(foundCountry),
            totalConfirmed,
            totalRecovered,
            totalDeaths,
            foundSituations[foundSituations.length - 1].date
        )
    );
};