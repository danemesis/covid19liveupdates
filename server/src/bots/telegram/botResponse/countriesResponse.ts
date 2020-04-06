import {ContinentCountriesSituation, CountrySituation, CountrySituationInfo} from "../../../models/covid19.models";
import {getChatId} from "../utils/chat";
import {getCountriesSituation} from "../../../services/domain/covid19";
import {getTableHeader, getTableRowMessageForCountry} from "../../../messages/feature/countryMessages";
import {Country} from "../../../models/country.models";
import {getCountriesSumupMessage, getCountriesTableHTML} from "../../../messages/feature/countriesMessages";
import {getContinentsKeyboard} from '../utils/keyboard';

//TODO: prolly remove this responseHandler
export const countriesResponse = async (bot, message) => {
    const countriesSituation: Array<[Country, Array<CountrySituationInfo>]> = await getCountriesSituation();
    const continentCountries: ContinentCountriesSituation = {};
    let worldTotalConfirmed = 0;
    let worldTotalRecovered = 0;
    let worldTotalDeaths = 0;

    countriesSituation
        .forEach(([country, situations]: [Country, Array<CountrySituationInfo>]) => {
            const {confirmed, recovered, deaths} = situations[situations.length - 1];

            worldTotalConfirmed += confirmed;
            worldTotalRecovered += recovered;
            worldTotalDeaths += deaths;

            const countrySituationResult: CountrySituation = {
                lastUpdateDate: situations[situations.length - 1].date,
                country,
                confirmed,
                recovered,
                deaths
            };
            const prevCountriesResult = continentCountries[country.continent]
                ? continentCountries[country.continent]
                : [];
            continentCountries[country.continent] = [
                ...prevCountriesResult,
                countrySituationResult
            ];
        });

    // Send overall world info,
    await bot.sendMessage(
        getChatId(message),
        getCountriesSumupMessage(
            worldTotalConfirmed,
            worldTotalRecovered,
            worldTotalDeaths,
            countriesSituation.length,
            Object.keys(continentCountries).length
        )
    );

    // Send all info split by continents,
    for (const [continent, countries] of Object.entries(continentCountries)
        .map(
            ([continent, countries]) => [continent, countries.sort((country1, country2) => country2.confirmed - country1.confirmed)]
        )) {
        const portionSize: number = 30;
        let portionStart: number = 0;
        let portionEnd = portionSize;
        let portionMessage = [];

        while (portionStart <= countries.length) {
            portionMessage = [getTableHeader()];

            (countries as Array<CountrySituation>)
                .slice(portionStart, portionEnd)
                .forEach(({
                              country: {name},
                              lastUpdateDate,
                              confirmed,
                              recovered,
                              deaths
                          }: CountrySituation) => {
                    portionMessage.push(
                        getTableRowMessageForCountry({
                            name,
                            confirmed,
                            recovered,
                            deaths,
                            lastUpdateDate
                        })
                    );
                });

            await bot.sendMessage(
                getChatId(message),
                getCountriesTableHTML({continent, portionMessage})
                ,
                {parse_mode: "HTML"}
            );

            portionStart = portionEnd;
            portionEnd += portionSize;
        }
    }
};

export const countriesByContinent = (continent) => async (bot, message, chatId) => {
    const countriesSituation: Array<[Country, Array<CountrySituationInfo>]> = await getCountriesSituation();
    const continentCountries: ContinentCountriesSituation = {};
    let worldTotalConfirmed = 0;
    let worldTotalRecovered = 0;
    let worldTotalDeaths = 0;

    countriesSituation
        .forEach(([country, situations]: [Country, Array<CountrySituationInfo>]) => {
            const {confirmed, recovered, deaths} = situations[situations.length - 1];

            worldTotalConfirmed += confirmed;
            worldTotalRecovered += recovered;
            worldTotalDeaths += deaths;

            const countrySituationResult: CountrySituation = {
                lastUpdateDate: situations[situations.length - 1].date,
                country,
                confirmed,
                recovered,
                deaths
            };
            const prevCountriesResult = continentCountries[country.continent]
                ? continentCountries[country.continent]
                : [];
            continentCountries[country.continent] = [
                ...prevCountriesResult,
                countrySituationResult
            ];
        });

    const portionMessage = [getTableHeader()];
    portionMessage.push();
    continentCountries[continent]
        .sort((country1, country2) => country2.confirmed - country1.confirmed)
        .forEach(({
                      country: {name},
                      lastUpdateDate,
                      confirmed,
                      recovered,
                      deaths
                  }: CountrySituation) => {
            portionMessage.push(
                getTableRowMessageForCountry({
                    name,
                    confirmed,
                    recovered,
                    deaths,
                    lastUpdateDate
                })
            );
        });

    await bot.sendMessage(
        chatId,
        getCountriesTableHTML({continent, portionMessage})
        ,
        {parse_mode: "HTML"}
    );
};

export const countries = async (bot, message) => {
    const countriesSituation: Array<[Country, Array<CountrySituationInfo>]> = await getCountriesSituation();
    const continentCountries: ContinentCountriesSituation = {};
    let worldTotalConfirmed = 0;
    let worldTotalRecovered = 0;
    let worldTotalDeaths = 0;

    countriesSituation
        .forEach(([country, situations]: [Country, Array<CountrySituationInfo>]) => {
            const {confirmed, recovered, deaths} = situations[situations.length - 1];

            worldTotalConfirmed += confirmed;
            worldTotalRecovered += recovered;
            worldTotalDeaths += deaths;

            const countrySituationResult: CountrySituation = {
                lastUpdateDate: situations[situations.length - 1].date,
                country,
                confirmed,
                recovered,
                deaths
            };
            const prevCountriesResult = continentCountries[country.continent]
                ? continentCountries[country.continent]
                : [];
            continentCountries[country.continent] = [
                ...prevCountriesResult,
                countrySituationResult
            ];
        });

    // Send overall world info,
    await bot.sendMessage(
        getChatId(message),
        getCountriesSumupMessage(
            worldTotalConfirmed,
            worldTotalRecovered,
            worldTotalDeaths,
            countriesSituation.length,
            Object.keys(continentCountries).length
        ),
        getContinentsKeyboard()
    );
}