import {getActiveCases} from "../covid19Messages";
import {table, tableConfig} from "../../models/table.models";

export const getCountriesSumupMessage = (
    worldConfirmed: number,
    worldRecovered: number,
    worldDeaths: number,
    countries: number,
    continents: number,
): string =>
    `In the world 🌍\nConfirmed: ${worldConfirmed}, active: ${getActiveCases(worldConfirmed, worldRecovered, worldDeaths)} recovered: ${worldRecovered}, death: ${worldDeaths} in ${countries} countries, on ${continents} continents`;

export const getCountriesTableHTML = ({
                                          continent,
                                          portionMessage,
                                      }): string => `🗺️ ${continent}\n\n<pre>${table(portionMessage, tableConfig)}</pre>`;