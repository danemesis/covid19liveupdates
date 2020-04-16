import {name} from 'country-emoji';
import {Country} from '../../models/country.models';

export const isMessageCountryFlag = (message: string): boolean => !!name(message);
export const getCountryNameByFlag = (message: string): string => name(message);

export const getCountryByMessage = (message: string, countries: Array<Country>): Country => {
    return countries.find((country: Country) => country.name.toLocaleUpperCase() === message.toLocaleUpperCase());
};
