import { Country } from './country.models';

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
export type CountryActiveSituationInfo = CountrySituationInfo & {
    active: number;
};

export interface ContinentsCountries {
    [continentName: string]: Array<Country>;
}

export interface ContinentCountriesSituations {
    [continentName: string]: Array<CountrySituationInfo>;
}

export interface WorldOverallInformation {
    confirmed: number;
    recovered: number;
    deaths: number;
    continentCountriesSituations: ContinentCountriesSituations;
}

export interface ContinentOverallInformation {
    confirmed: number;
    recovered: number;
    deaths: number;
    countriesSituation: Array<CountryActiveSituationInfo>;
}
