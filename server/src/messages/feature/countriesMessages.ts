import { table, tableConfig } from '../../models/table.models';
import { flag } from 'country-emoji';
import { getActiveCases } from '../../services/domain/countries';

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

export const getTableHeader = (): Array<string> => [
    'Country',
    'Active',
    'Recovered',
    'Deaths',
];

export const getTableCountryRowMessage = (
    name,
    active,
    recovered,
    deaths
): Array<string> => [
    `${flag(name) ?? ''} ${name}`,
    `${active}`,
    `${recovered}`,
    `${deaths}`,
];

export const getCountriesTableHTML = (
    continent,
    confirmed,
    recovered,
    deaths,
    countriesSituation,
    portionMessage
): string =>
    `🗺️ ${continent}\nConfirmed: ${confirmed}, active: ${getActiveCases(
        confirmed,
        recovered,
        deaths
    )} recovered: ${recovered}, death: ${deaths}` +
    ` in ${countriesSituation.length} countries, ${continent}` +
    `\n<pre>${table(portionMessage, tableConfig)}</pre>`;
