import { name } from 'country-emoji';
import { Country } from '../../models/country.models';
import { isTextEqual } from '../isEqual';

export const isMessageCountryFlag = (message: string): boolean =>
    !!name(message);
export const getCountryNameByFlag = (message: string): string => name(message);

export const getCountryByMessage = (
    countryName: string,
    countries: Array<Country>
): Country => {
    return countries.find((country: Country) =>
        isTextEqual(country.name, countryName)
    );
};
