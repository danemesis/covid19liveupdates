import {Country} from "./country.models";

export interface ApiCountriesCovid19Situation {
    [country: string]: Array<ApiCovid19Situation>;
}

export interface ApiCovid19Situation {
    date: string;
    confirmed: number;
    deaths: number;
    recovered: number;
}

export type CountrySituationInfo = Country & ApiCovid19Situation;

export interface CountrySituation {
    lastUpdateDate: string;
    country: Country;
    confirmed: number;
    recovered: number;
    deaths: number;
}

export interface ContinentCountriesSituation {
    [continentName: string]: Array<CountrySituation>
}

export type CountryLiveInfoModel  = {
        Country: string;
        CountryCode: string;
        Lat: string;
        Lon: string;
        Cases: number;
        Status: string;
        Date: string;
}
