import { UserPresentationalCountryNameString } from '../../models/tsTypes.models';
import {
    ApiCountriesCovid19Situation,
    ApiCovid19Situation,
    CountrySituationInfo,
} from '../../models/covid19.models';
import { COVID19_FETCH_SALT, TIMES, LogCategory } from '../../models/constants';
import { Country } from '../../models/country.models';
import { fetchCovid19Data } from '../api/api-covid19';
import { CountryLookup } from '../../models/country-code-lookup.models';
import { getCountryNameFormat } from '../../utils/featureHelpers/country';
import { getCountryByName, getDefaultCountry } from './countryLookup';
import { SubscriptionType } from '../../models/subscription.models';
import { logger } from '../../utils/logger';
import * as TelegramBot from 'node-telegram-bot-api';

// TODO: Improve Cached management
class CachedCovid19CountriesData {
    private subscribers: Array<[Array<SubscriptionType>, Function]> = [];

    public set countriesData(
        countriesData: [number, Array<[Country, Array<CountrySituationInfo>]>]
    ) {
        this.cachedCountriesData = countriesData;

        this.subscribers.forEach(
            ([subscriptionsType, cb]: [Array<SubscriptionType>, Function]) => {
                if (
                    subscriptionsType.some(
                        (subscriptionType: SubscriptionType) =>
                            subscriptionType !==
                            SubscriptionType.TrackCountryUpdates
                    )
                ) {
                    cb(this.countriesData);
                }
            }
        );
    }

    public get countriesData(): [
        number,
        Array<[Country, Array<CountrySituationInfo>]>
    ] {
        return this.cachedCountriesData;
    }

    public set availableCountriesData(countries: Array<Country>) {
        this.cachedAvailableCountriesData = countries;

        this.subscribers.forEach(
            ([subscriptionsType, cb]: [Array<SubscriptionType>, Function]) => {
                if (
                    subscriptionsType.some(
                        (subscriptionType: SubscriptionType) =>
                            subscriptionType ===
                            SubscriptionType.TrackCountryUpdates
                    )
                ) {
                    cb(this.availableCountriesData);
                }
            }
        );
    }

    public get availableCountriesData(): Array<Country> {
        return this.cachedAvailableCountriesData;
    }

    constructor(
        private cachedCountriesData: [
            number,
            Array<[Country, Array<CountrySituationInfo>]>
        ] = [0, []],
        private cachedAvailableCountriesData: Array<Country> = []
    ) {}

    public subscribe(
        cb: Function,
        subscriptionsType: Array<SubscriptionType>
    ): void {
        this.subscribers = [...this.subscribers, [subscriptionsType, cb]];
    }
}

export const cachedCovid19CountriesData = new CachedCovid19CountriesData();

export const adaptCountryToSystemRepresentation = (
    country: string
): UserPresentationalCountryNameString =>
    getCountryNameFormat(country.trim().toLocaleUpperCase());

function adaptApiCountriesResponse(
    apiCountriesSituation: ApiCountriesCovid19Situation
): Array<[Country, Array<CountrySituationInfo>]> {
    return Object.entries(apiCountriesSituation).map(
        ([apiCountry, apiSituations]: [string, Array<ApiCovid19Situation>]) => {
            const adaptedCountry: UserPresentationalCountryNameString = adaptCountryToSystemRepresentation(
                apiCountry
            );
            const countryLookup: CountryLookup =
                getCountryByName(adaptedCountry) ??
                getDefaultCountry(adaptedCountry);

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
                })),
            ];
        }
    );
}

function getCovid19Data(): Promise<
    Array<[Country, Array<CountrySituationInfo>]>
> {
    return fetchCovid19Data().then(
        (apiCountriesSituation: ApiCountriesCovid19Situation) => {
            const countriesSituation: Array<[
                Country,
                Array<CountrySituationInfo>
            ]> = adaptApiCountriesResponse(apiCountriesSituation);
            cachedCovid19CountriesData.availableCountriesData = countriesSituation.map(
                ([country]) => country
            );
            cachedCovid19CountriesData.countriesData = [
                Date.now(),
                countriesSituation,
            ];

            return countriesSituation;
        }
    );
}

export function tryToUpdateCovid19Cache(): Promise<TelegramBot.Message> {
    return getCovid19Data()
        .then((v) => undefined)
        .catch((e) =>
            logger.error(
                '[ERROR] While fetching Hopkins uni data',
                e,
                LogCategory.Covid19DataUpdate
            )
        );
}

export function getCountriesSituation(): Promise<
    Array<[Country, Array<CountrySituationInfo>]>
> {
    const [lastFetchedTime, countriesSituation] =
        cachedCovid19CountriesData.countriesData ?? [];

    if (
        lastFetchedTime >
        Date.now() - TIMES.MILLISECONDS_IN_HOUR - COVID19_FETCH_SALT
    ) {
        return Promise.resolve(countriesSituation);
    }

    return getCovid19Data();
}

export function getAvailableCountries(): Promise<Array<Country>> {
    if (!!cachedCovid19CountriesData.availableCountriesData?.length) {
        return Promise.resolve(
            cachedCovid19CountriesData.availableCountriesData
        );
    }

    return getCovid19Data().then(
        (countriesSituation: Array<[Country, Array<CountrySituationInfo>]>) =>
            countriesSituation.map(([country]) => country)
    );
}
