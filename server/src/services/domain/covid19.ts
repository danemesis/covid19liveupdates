import {UserPresentationalCountryNameString} from "../../models/tsTypes";
import {ApiCountriesCovid19Situation, ApiCovid19Situation, CountrySituationInfo} from "../../models/covid19";
import {TIMES} from "../../models/constants";
import {Country} from "../../models/country";
import {fetchCovid19Data} from "../api/covid19";
import {CountryLookup} from "../../models/country-code-lookup";
import * as lookup from 'country-code-lookup';
import {getCountryNameFormat} from "../../utils/utils";
import {getCountryByName, getDefaultCountry} from "./countryLookup";

let availableContinents: Array<string> = [];
let availableCountries: Array<Country> = [];
let cachedCountriesResponse: [number, Array<[Country, Array<CountrySituationInfo>]>];

export const adaptCountryToSystemRepresentation =
    (country: string): UserPresentationalCountryNameString => getCountryNameFormat(
        country
            .trim()
            .toLocaleUpperCase()
    );

function adaptApiCountriesResponse(apiCountriesSituation: ApiCountriesCovid19Situation): Array<[Country, Array<CountrySituationInfo>]> {
    return Object.entries(apiCountriesSituation)
        .map(([apiCountry, apiSituations]: [string, Array<ApiCovid19Situation>]) => {
                const adaptedCountry: UserPresentationalCountryNameString = adaptCountryToSystemRepresentation(apiCountry);
                const countryLookup: CountryLookup = getCountryByName(adaptedCountry) ?? getDefaultCountry(adaptedCountry);

                const country: Country = {
                    name: adaptedCountry,
                    region: countryLookup.region,
                    continent: countryLookup.continent,
                };

                return [
                    country,
                    apiSituations.map((situation: ApiCovid19Situation) => ({
                        ...country,
                        ...situation,
                        recovered: situation.recovered ?? 0,
                        deaths: situation.deaths ?? 0,
                        confirmed: situation.confirmed ?? 0,
                    }))
                ]
            }
        );
}

function getCovid19Data(): Promise<Array<[Country, Array<CountrySituationInfo>]>> {
    return fetchCovid19Data()
        .then((apiCountriesSituation: ApiCountriesCovid19Situation) => {
            const countriesSituation: Array<[Country, Array<CountrySituationInfo>]> = adaptApiCountriesResponse(apiCountriesSituation);
            availableCountries = countriesSituation.map(([country]) => country);
            cachedCountriesResponse = [Date.now(), countriesSituation];

            return countriesSituation;
        });
}

export function getCountriesSituation(): Promise<Array<[Country, Array<CountrySituationInfo>]>> {
    const [lastFetchedTime, countriesSituation] = cachedCountriesResponse ?? [];

    if (lastFetchedTime > Date.now() - TIMES.MILLISECONDS_IN_HOUR) {
        return Promise.resolve(countriesSituation);
    }

    return getCovid19Data();
}

export function getAvailableCountries(): Promise<Array<Country>> {
    if (!!availableCountries?.length) {
        return Promise.resolve(availableCountries);
    }

    return getCovid19Data()
        .then((countriesSituation: Array<[Country, Array<CountrySituationInfo>]>) =>
            countriesSituation.map(([country]) => country)
        )
}