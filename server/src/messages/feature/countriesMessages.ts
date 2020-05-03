import { table, tableConfig } from '../../models/table.models';
import { flag } from 'country-emoji';
import { getActiveCases } from '../../services/domain/countries';
import { getLocalizedMessages } from '../../services/domain/localization.service';

export const getCountriesWorldMessage = (
    locale: string | null,
    worldConfirmed: number,
    worldRecovered: number,
    worldDeaths: number,
    countries: number,
    continents: number
): string =>
    `${getLocalizedMessages(locale, 'In the world')} 🌍\n${getLocalizedMessages(
        locale,
        'Confirmed'
    )}: ${worldConfirmed}, ${getLocalizedMessages(
        locale,
        'active'
    )}: ${getActiveCases(
        worldConfirmed,
        worldRecovered,
        worldDeaths
    )} ${getLocalizedMessages(
        locale,
        'recovered'
    )}: ${worldRecovered}, ${getLocalizedMessages(
        locale,
        'death'
    )}: ${worldDeaths} in ${countries} ${getLocalizedMessages(
        locale,
        'countries'
    )}, ${getLocalizedMessages(
        locale,
        'on'
    )} ${continents} ${getLocalizedMessages(locale, 'continents')}`;

export const getTableHeader = (locale: string | null): Array<string> => [
    getLocalizedMessages(locale, 'Country'),
    getLocalizedMessages(locale, 'Active'),
    getLocalizedMessages(locale, 'Recovered'),
    getLocalizedMessages(locale, 'Deaths'),
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

export const getCountriesTableHTMLMessage = (
    locale,
    continent,
    confirmed,
    recovered,
    deaths,
    countriesSituation,
    portionMessage
): string =>
    `🗺️ ${continent}\n${getLocalizedMessages(
        locale,
        'Confirmed'
    )}: ${confirmed}, active: ${getActiveCases(
        confirmed,
        recovered,
        deaths
    )} ${getLocalizedMessages(
        locale,
        'recovered'
    )}: ${recovered}, ${getLocalizedMessages(locale, 'death')}: ${deaths}` +
    ` ${getLocalizedMessages(locale, 'in')} ${
        countriesSituation.length
    } ${getLocalizedMessages(locale, 'countries')}, ${continent}` +
    `\n<pre>${table(portionMessage, tableConfig)}</pre>`;

export const getCountriesForContinentMessage = (locale: string): string =>
    getLocalizedMessages(locale, 'Check continent\'s countries statistic');
