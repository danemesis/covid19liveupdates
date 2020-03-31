import {CountryLookup} from "../../models/country-code-lookup";
import * as lookup from 'country-code-lookup';

const COUNTRIES_LOOKUP_LIST: Array<CountryLookup> = lookup.countries;

export const getDefaultCountry = (name): CountryLookup => ({
    continent: 'Other',
    region: 'Other',
    country: name,
    capital: name,
    fips: 'Other',
    iso2: 'Other',
    iso3: 'Other',
    isoNo: 'Other',
    internet: 'Other'
});

export const getCountryByName = (name: string): CountryLookup => {
    for (let i = 0; i < COUNTRIES_LOOKUP_LIST.length; i++) {
        if (COUNTRIES_LOOKUP_LIST[i].country.toLocaleLowerCase() === name.toLocaleLowerCase()) {
            return COUNTRIES_LOOKUP_LIST[i]
        }
    }

    return null;
};
