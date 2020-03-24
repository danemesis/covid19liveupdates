import {getChatId} from "../utils/chat";
import {getAvailableCountries, getCountriesSituation} from "../../../api/covid19";
import {Situation} from "../../../models/covid";

const EXPLANATION_MESSAGE: string = 'To check country use: "/country [COUNTRY NAME]" template (Not case sensative; If there is <<space>>, then use <<_>> instead)';

export const showCountries = (bot, message) => {
    getAvailableCountries()
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

const getCountryFromMessage = (message): string => message.split(' ')[1];

export const showCountry = async (bot, message): Promise<void> => {
    const requestedCountry: string = getCountryFromMessage(message.text);
    const country = [...await getAvailableCountries()]
        .find(country => country === requestedCountry);

    if (!country) {
        bot.sendMessage(getChatId(message), `Cannot find data for ${requestedCountry}`);
        return;
    }

    const allCountries: Array<[string, Array<Situation>]> = await getCountriesSituation();
    const countrySituation: Array<Situation> = allCountries
        .find(([receivedCountry]) => receivedCountry === country)
        .map(([country, situations]: [string, Array<Situation>]) => situations);

    console.log('countrySituation', countrySituation);

    let totalRecovered = 0;
    let totalConfirmed = 0;
    let totalDeaths = 0;

    countrySituation.forEach(({confirmed, deaths, recovered}: Situation) => {
        console.log('recovered', recovered, confirmed, deaths);
        totalRecovered += recovered;
        totalConfirmed += confirmed;
        totalDeaths += deaths;
    });

    bot.sendMessage(
        getChatId(message),
        `${country} has ${totalConfirmed} confirmed cases, ${totalRecovered} recovered, ${totalDeaths} deaths. Last update time: ${countrySituation[0].date}`
    );
};