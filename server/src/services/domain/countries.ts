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
import { isTextEqual } from '../../utils/isEqual';

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
    const theCountryName: string = getCountryNameFormat(countryName);
    const allCountriesSituations: Array<[
        Country,
        Array<CountrySituationInfo>
    ]> = await getCountriesSituation();
    const foundCountrySituations: [
        Country,
        Array<CountrySituationInfo>
    ] = allCountriesSituations.find(([receivedCountry, situations]) =>
        isTextEqual(receivedCountry.name, theCountryName)
    );

    if (
        !foundCountrySituations ||
        !foundCountrySituations?.length ||
        !foundCountrySituations[0] ||
        !foundCountrySituations[1].length
    ) {
        throw new Error(getCountryNonExistenceErrorMessage(theCountryName));
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
        .filter(([country, _]: [Country, Array<CountrySituationInfo>]) =>
            isTextEqual(country.continent, continent)
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

/**
 * Map<string, string>, where the first string is an country
 * received from the user in different forms and the second string
 * is the country our system understands
 */
const countriesExceptionMap: Map<string, string> = new Map<string, string>([
    ['united states', 'United States'],
    ['us', 'United States'],
    ['usa', 'United States'],
    ['russian federation', 'Russia'],
    ['uk', 'United Kingdom'],
    ['united kingdom', 'United Kingdom'],
    ['united arab emirates', 'United Arab Emirates'],
    ['bosnia and herzegovina', 'Bosnia and Herzegovina'],
    ['central african republic', 'Central African Republic'],
    ['new zealand', 'New Zealand'],
    ['papua new guinea', 'Papua New Guinea'],
    ['saint kitts and nevis', 'Saint Kitts and Nevis'],
    ['bahamas', 'The Bahamas'],
    ['congo (brazzaville)', 'Republic of the Congo'],
    ['congo (kinshasa)', 'Republic of the Congo'],
    ['korea, south', 'North Korea'],
    ['taiwan*', 'Taiwan'],
    ['burma', 'Myanmar (Burma)'],
    ['kosovo', 'Republic of Kosovo'],
    ['gambia', 'The Gambia'],
    ['czechia', 'Czech Republic'],
    ['cabo verde', 'Cape Verde'],
    ['holy see', 'Holy See (Vatican City)'],
]);

export const getCountryNameFormat = (country: string): string => {
    const countryLowerCase = country.toLocaleLowerCase();

    return countriesExceptionMap.has(countryLowerCase)
        ? countriesExceptionMap.get(countryLowerCase)
        : countryLowerCase // e.g. Make ukraine => Ukraine
              .slice(0, 1)
              .toLocaleUpperCase()
              .concat(countryLowerCase.slice(1).toLocaleLowerCase());
};
