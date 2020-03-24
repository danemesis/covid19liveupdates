export interface ApiCountrySituation {
    [country: string]: Array<Situation>;
}

export interface Situation {
    date: string;
    confirmed: number;
    deaths: number;
    recovered: number;
}

export interface OverallCountrySituationResponse {
    date: string;
    countryName: string;
    totalConfirmed: number;
    totalRecovered: number;
    totalDeaths: number;
}