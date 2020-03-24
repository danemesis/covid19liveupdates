import {ApiCountrySituation, Situation} from "../models/covid";
import axios, {AxiosResponse} from 'axios';

const MILLISECONDS_IN_HOUR = 3600000;

let availableCountries = [];
let cachedCountriesResponse: [number, Array<[string, Array<Situation>]>];

function adaptCountry(country: string): string {
    return country
        .trim()
        .toLocaleLowerCase()
        .replace(' ', '_');
}

function getCovidData(): Promise<Array<[string, Array<Situation>]>> {
    return axios.get("https://pomber.github.io/covid19/timeseries.json")
        .then((response: AxiosResponse): ApiCountrySituation => response.data)
        .then((apiCountriesSituation: ApiCountrySituation) => {
            const countriesSituation: Array<[string, Array<Situation>]> = Object.entries(apiCountriesSituation)
                .map(([country, situations]) => [adaptCountry(country), situations]);

            availableCountries = countriesSituation.map(([country]) => country);
            cachedCountriesResponse = [Date.now(), countriesSituation];

            return countriesSituation;
        });
}

export function getCountriesSituation(): Promise<Array<[string, Array<Situation>]>> {
    const [lastFetchedTime, countriesSituation] = cachedCountriesResponse ?? [];

    if (lastFetchedTime > Date.now() - MILLISECONDS_IN_HOUR) {
        return Promise.resolve(countriesSituation);
    }

    return getCovidData();
}

export function getAvailableCountries(): Promise<Array<string>> {
    if (!!availableCountries?.length) {
        return Promise.resolve(availableCountries);
    }

    return getCovidData()
        .then((countriesSituation: Array<[string, Array<Situation>]>) =>
            countriesSituation.map(
                ([country]) => country
            )
        )
}