import { Country } from '../../models/country.models';
import {
    ContinentCountriesSituations,
    ContinentOverallInformation,
    ContinentsCountries,
    CountryActiveSituationInfo,
    CountrySituationInfo,
    WorldOverallInformation,
} from '../../models/covid19.models';
import { getCountriesSituation } from './covid19';
import { getCountryNonExistenceErrorMessage } from '../../messages/feature/countryMessages';

export const getActiveCases = (
    totalConfirmed: number,
    totalRecovered: number,
    totalDeaths: number
): number => totalConfirmed - totalRecovered - totalDeaths ?? 0;

export const getCountriesByContinent = (
    countries: Array<Country>
): ContinentsCountries => {
    const continentsCountries: ContinentsCountries = {};

    countries.forEach((country: Country) => {
        const continentCountries = continentsCountries[country.continent];

        if (!!continentCountries?.length) {
            continentCountries.push(country);
            return;
        }

        continentsCountries[country.continent] = [country];
    });

    return continentsCountries;
};

export const getRequestedCountry = async (
    countryName: string
): Promise<[Country, Array<CountrySituationInfo>]> => {
    const allCountriesSituations: Array<[
        Country,
        Array<CountrySituationInfo>
    ]> = await getCountriesSituation();

    const foundCountrySituations: [
        Country,
        Array<CountrySituationInfo>
    ] = allCountriesSituations.find(
        ([receivedCountry, situations]) => receivedCountry.name === countryName
    );

    if (
        !foundCountrySituations ||
        !foundCountrySituations?.length ||
        !foundCountrySituations[0] ||
        !foundCountrySituations[1].length
    ) {
        throw new Error(getCountryNonExistenceErrorMessage(countryName));
    }

    return foundCountrySituations;
};

export const getWorldOverallInformation = async (): Promise<
    WorldOverallInformation
> => {
    const countriesSituation: Array<[
        Country,
        Array<CountrySituationInfo>
    ]> = await getCountriesSituation();

    const continentCountriesSituations: ContinentCountriesSituations = {};
    let worldTotalConfirmed = 0;
    let worldTotalRecovered = 0;
    let worldTotalDeaths = 0;

    countriesSituation.forEach(
        ([country, situations]: [Country, Array<CountrySituationInfo>]) => {
            const lastCountrySituation: CountrySituationInfo =
                situations[situations.length - 1];
            const { confirmed, recovered, deaths } = lastCountrySituation;

            worldTotalConfirmed += confirmed;
            worldTotalRecovered += recovered;
            worldTotalDeaths += deaths;

            const prevCountriesResult = continentCountriesSituations[
                country.continent
            ]
                ? continentCountriesSituations[country.continent]
                : [];
            continentCountriesSituations[country.continent] = [
                ...prevCountriesResult,
                lastCountrySituation,
            ];
        }
    );

    return {
        confirmed: worldTotalConfirmed,
        recovered: worldTotalRecovered,
        deaths: worldTotalDeaths,
        continentCountriesSituations,
    };
};

export const getContinentOverallInformation = async (
    continent: string
): Promise<ContinentOverallInformation> => {
    const allCountriesSituation: Array<[
        Country,
        Array<CountrySituationInfo>
    ]> = await getCountriesSituation();

    let countriesSituation: Array<CountryActiveSituationInfo> = [];
    let continentTotalConfirmed: number = 0;
    let continentTotalRecovered: number = 0;
    let continentTotalDeath: number = 0;

    allCountriesSituation
        .filter(
            ([country, _]: [Country, Array<CountrySituationInfo>]) =>
                country.continent === continent
        )
        .forEach(([_, situations]: [Country, Array<CountrySituationInfo>]) => {
            const lastCountrySituationInfo: CountrySituationInfo =
                situations[situations.length - 1];
            const { confirmed, recovered, deaths } = lastCountrySituationInfo;
            const active = getActiveCases(confirmed, recovered, deaths);

            continentTotalConfirmed += confirmed;
            continentTotalRecovered += recovered;
            continentTotalDeath += deaths;

            countriesSituation = [
                ...countriesSituation,
                {
                    ...lastCountrySituationInfo,
                    active,
                },
            ];
        });

    return {
        confirmed: continentTotalConfirmed,
        recovered: continentTotalRecovered,
        deaths: continentTotalDeath,
        countriesSituation,
    };
};
