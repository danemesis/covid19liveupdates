import { UserRegExps } from '../../models/constants';
import { getActiveCases } from '../../services/domain/countries';
import { flag } from 'country-emoji';

export const getUserInputWithoutCountryNameMessage = (): string =>
    `Sorry, but I can show country only by country name.` +
    ` Enter country name by a pattern ${UserRegExps.CountryData} [country name]`;

export const getCountryNonExistenceErrorMessage = (country: string): string =>
    `Sorry, but I cannot find anything for ${country}.` +
    ` I will save your request and will work on it`;

export const getCountryMessage = (
    name,
    confirmed,
    recovered,
    deaths,
    date
): string =>
    `${flag(name) ?? ''} ${name}, ${confirmed} confirmed, ${getActiveCases(
        confirmed,
        recovered,
        deaths
    )} active, ${recovered} recovered, ${deaths} deaths. ⏱️${date}`;

export const getCountryIKActionMessage = (country: string): string =>
    `More on ${country}`;
