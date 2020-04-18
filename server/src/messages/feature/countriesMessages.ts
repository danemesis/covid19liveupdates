import { getActiveCases } from '../covid19Messages';
import { table, tableConfig } from '../../models/table.models';

export const getCountriesWorldMessage = (
    worldConfirmed: number,
    worldRecovered: number,
    worldDeaths: number,
    countries: number,
    continents: number
): string =>
    `In the world 🌍\nConfirmed: ${worldConfirmed}, active: ${getActiveCases(
        worldConfirmed,
        worldRecovered,
        worldDeaths
    )} recovered: ${worldRecovered}, death: ${worldDeaths} in ${countries} countries, on ${continents} continents`;

export const getCountriesTableHTML = ({
    continent,
    continentTotalConfirmed,
    continentTotalRecovered,
    continentTotalDeath,
    portionMessage,
}): string =>
    `🗺️ ${continent}. Total active: ${continentTotalConfirmed}, recovered: ${continentTotalRecovered}, death: ${continentTotalDeath}
                                       \n<pre>${table(
                                           portionMessage,
                                           tableConfig
                                       )}</pre>`;
