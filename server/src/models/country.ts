import {UserPresentationalCountryNameString} from "./tsTypes";

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