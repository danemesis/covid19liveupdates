import {Country} from "./country";

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

export interface OverallCountrySituationResponse {
    lastUpdateDate: string;
    country: Country;
    totalConfirmed: number;
    totalRecovered: number;
    totalDeaths: number;
}
