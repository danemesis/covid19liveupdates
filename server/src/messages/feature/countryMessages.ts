import { Country, CountryMessage } from '../../models/country.models';
import { getActiveCases } from '../covid19Messages';
import { flag } from 'country-emoji';
import { UserRegExps } from '../../models/constants';

export const getUserInputWithoutCountryNameMessage = (): string =>
    `Sorry, but I can show country only by country name.` +
    ` Enter country name by a pattern ${UserRegExps.CountryData} [country name]`;

export const getCountryNonExistenceErrorMessage = (country: string): string =>
    `Sorry, but I cannot find anything for ${country}.` +
    ` I will save your request and will work on it`;

export const getTableCountryRowMessage = ({
    name,
    confirmed,
    recovered,
    deaths,
    lastUpdateDate,
}: CountryMessage): Array<string> => [
    `${flag(name) ?? ''} ${name}`,
    `${getActiveCases(confirmed, recovered, deaths)}`,
    `${recovered}`,
    `${deaths}`,
];

export const getTableHeader = (): Array<string> => [
    'Country',
    'Active',
    'Recovered',
    'Deaths',
];

export const getCountryMessage = ({
    name,
    confirmed,
    recovered,
    deaths,
    lastUpdateDate,
}: CountryMessage): string =>
    `${flag(name) ?? ''} ${name}, ${getActiveCases(
        confirmed,
        recovered,
        deaths
    )} active, ${recovered} recovered, ${deaths} deaths. ⏱️${lastUpdateDate}`;

export const getCountryIKActionMessage = (country: string): string =>
    `More on ${country}`;
