import { UserRegExps } from '../../models/constants';
import { getActiveCases } from '../../services/domain/countries';
import { flag } from 'country-emoji';
import { getLocalizedMessages } from '../../services/domain/localization.service';

export const getUserInputWithoutCountryNameMessage = (
    locale: string | null
): string =>
    `${getLocalizedMessages(
        locale,
        'Sorry, but I can show country only by country name'
    )}.` +
    ` ${getLocalizedMessages(locale, 'Enter country name by a pattern')} ${
        UserRegExps.CountryData
    } ${getLocalizedMessages(locale, '[country name]')}`;

export const getCountryNonExistenceErrorMessage = (country: string): string =>
    `Sorry, but I cannot find anything for ${country}.` +
    ` I will save your request and will work on it`;

export const getCountryMessage = (
    locale: string | null,
    name,
    confirmed,
    recovered,
    deaths,
    date
): string =>
    `${flag(name) ?? ''} ${name}, ${confirmed} ${getLocalizedMessages(
        locale,
        'confirmed'
    )}, ${getActiveCases(confirmed, recovered, deaths)} ${getLocalizedMessages(
        locale,
        'active'
    )}, ${recovered} ${getLocalizedMessages(
        locale,
        'recovered'
    )}, ${deaths} ${getLocalizedMessages(locale, 'death')}. ⏱️${date}`;

export const getCountryIKActionMessage = (
    locale: string | null,
    country: string
): string => `${getLocalizedMessages(locale, 'More on')} ${country}`;
