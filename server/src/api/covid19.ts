import {ApiCountrySituation, ApiSituation, CountrySituationInfo} from "../models/covid";
import axios, {AxiosResponse} from 'axios';
import {UpperCaseString} from "../models/tsTypes";
import {Country} from "../models/country";
import * as lookup from 'country-code-lookup';

const MILLISECONDS_IN_HOUR = 3600000;

let availableCountries: Array<Country> = [];
let cachedCountriesResponse: [number, Array<CountrySituationInfo>];

function adaptCountryToUpperCase(country: string): UpperCaseString {
    return country
        .trim()
        .toLocaleUpperCase();
}

function getCovidData(): Promise<Array<[string, Array<ApiSituation>]>> {
    return axios.get("https://pomber.github.io/covid19/timeseries.json")
        .then((response: AxiosResponse): ApiCountrySituation => response.data)
        .then((apiCountriesSituation: ApiCountrySituation) => {
            const countriesSituation: Array<[string, Array<ApiSituation>]> = Object.entries(apiCountriesSituation)
                .map(([apiCountry, situations]: [string, Array<ApiSituation>]) => {
                    const upperCaseCountry: UpperCaseString = adaptCountryToUpperCase(apiCountry);
                    const country: Country = {
                        name: upperCaseCountry,
                    }

                    return [
                            adaptCountryToUpperCase(country),
                            situations.map((situation: ApiSituation) => ({
                                ...situation,
                                recovered: situation.recovered ?? 0,
                                deaths: situation.deaths ?? 0,
                                confirmed: situation.confirmed ?? 0,
                            }))
                        ]
                    }
                );

            availableCountries = countriesSituation.map(([country]) => country);
            cachedCountriesResponse = [Date.now(), countriesSituation];

            return countriesSituation;
        });
}

export function getCountriesSituation(): Promise<Array<[string, Array<ApiSituation>]>> {
    const [lastFetchedTime, countriesSituation] = cachedCountriesResponse ?? [];

    if (lastFetchedTime > Date.now() - MILLISECONDS_IN_HOUR) {
        return Promise.resolve(countriesSituation);
    }

    return getCovidData();
}

export function getAvailableCountries(): Promise<Array<UpperCaseString>> {
    if (!!availableCountries?.length) {
        return Promise.resolve(availableCountries);
    }

    return getCovidData()
        .then((countriesSituation: Array<[string, Array<ApiSituation>]>) =>
            countriesSituation.map(
                ([country]) => country
            )
        )
}