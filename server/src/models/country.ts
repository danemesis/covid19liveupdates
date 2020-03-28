import {UserPresentationalCountryNameString} from "./tsTypes";

export interface Country {
    name: UserPresentationalCountryNameString;
    region: string;
    continent: string;
}

export interface CountryMessage {
    countryName: string;
    totalConfirmed: number;
    totalRecovered: number;
    totalDeaths: number;
    lastUpdateDate: string;
}