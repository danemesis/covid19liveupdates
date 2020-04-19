import {
    UpperCaseString,
    UserPresentationalCountryNameString,
} from '../../models/tsTypes.models';

const countriesExceptionMap: Map<UpperCaseString, string> = new Map<
    UpperCaseString,
    string
>([
    ['UNITED STATES', 'United States'],
    ['US', 'United States'],
    ['USA', 'United States'],
    ['RUSSIAN FEDERATION', 'Russia'],
    ['UNITED KINGDOM', 'United Kingdom'],
    ['UNITED ARAB EMIRATES', 'United Arab Emirates'],
    ['BOSNIA AND HERZEGOVINA', 'Bosnia and Herzegovina'],
    ['CENTRAL AFRICAN REPUBLIC', 'Central African Republic'],
    ['NEW ZEALAND', 'New Zealand'],
    ['PAPUA NEW GUINEA', 'Papua New Guinea'],
    ['SAINT KITTS AND NEVIS', 'Saint Kitts and Nevis'],
    ['BAHAMAS', 'The Bahamas'],
    ['CONGO (BRAZZAVILLE)', 'Republic of the Congo'],
    ['CONGO (KINSHASA)', 'Republic of the Congo'],
    ['KOREA, SOUTH', 'North Korea'],
    ['TAIWAN*', 'Taiwan'],
    ['BURMA', 'Myanmar (Burma)'],
    ['KOSOVO', 'Republic of Kosovo'],
    ['GAMBIA', 'The Gambia'],
    ['CZECHIA', 'Czech Republic'],
    ['CABO VERDE', 'Cape Verde'],
    ['HOLY SEE', 'Holy See (Vatican City)'],
]);

export const getCountryNameFormat = (
    country: UpperCaseString
): UserPresentationalCountryNameString =>
    countriesExceptionMap.has(country)
        ? countriesExceptionMap.get(country)
        : country
              .slice(0, 1)
              .toLocaleUpperCase()
              .concat(country.slice(1).toLocaleLowerCase());
