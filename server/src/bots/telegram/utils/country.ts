import {UpperCaseString} from "../../../models/tsTypes";

const countriesExceptionMap: Map<UpperCaseString, string> = new Map<UpperCaseString, string>([
    ['US', 'US'],
    ['UNITED KINGDOM', 'United Kingdom'],
    ['UNITED ARAB EMIRATES', 'United Arab Emirates'],
    ['BOSNIA AND HERZEGOVINA', 'Bosnia and Herzegovina'],
    ['CENTRAL AFRICAN REPUBLIC', 'Central African Republic'],
    ['NEW ZEALAND', 'New Zealand'],
    ['PAPUA NEW GUINEA', 'Papua New Guinea'],
    ['SAINT KITTS AND NEVIS', 'Saint Kitts and Nevis'],
]);

export const getCountryNameFormat = (country: UpperCaseString): string =>
    countriesExceptionMap.has(country)
        ? countriesExceptionMap.get(country)
        : country.slice(0, 1).toLocaleUpperCase().concat(country.slice(1).toLocaleLowerCase());
