import {UpperCaseString} from "./tsTypes";
import {Country} from "./country";

export interface ApiCountrySituation {
    [country: string]: Array<ApiSituation>;
}

export interface ApiSituation {
    date: string;
    confirmed: number;
    deaths: number;
    recovered: number;
}

export type CountrySituationInfo = Country & ApiSituation;

export interface OverallCountrySituationResponse {
    date: string;
    country: Country;
    totalConfirmed: number;
    totalRecovered: number;
    totalDeaths: number;
}
