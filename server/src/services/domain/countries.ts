import { Country } from '../../models/country.models';
import { ContinentsCountries } from '../../models/continent.models';
import { CountrySituationInfo } from '../../models/covid19.models';
import { getCountriesSituation } from './covid19';
import { getCountryNonExistenceErrorMessage } from '../../messages/feature/countryMessages';

export const getCountriesByContinent = (
    countries: Array<Country>
): ContinentsCountries => {
    const continentsCountries: ContinentsCountries = {};

    countries.forEach(({ name, continent }: Country) => {
        const continentCountries = continentsCountries[continent];

        if (!!continentCountries?.length) {
            continentCountries.push(name);
            return;
        }

        continentsCountries[continent] = [name];
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
