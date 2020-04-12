import {UserPresentationalCountryNameString} from './tsTypes.models';

export interface Country {
    name: UserPresentationalCountryNameString;
    region: string;
    continent: string;
}

export interface CountryMessage {
    name: string;
    confirmed: number;
    recovered: number;
    deaths: number;
    lastUpdateDate: string;
}