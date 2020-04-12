import {Country} from "../../models/country.models";
import {ContinentsCountries} from "../../models/continent.models";

export const getCountriesByContinent = (countries: Array<Country>): ContinentsCountries => {
    const continentsCountries: ContinentsCountries = {};

    countries
        .forEach(({name, continent}: Country) => {
            const continentCountries = continentsCountries[continent];

            if (!!continentCountries?.length) {
                continentCountries.push(name);
                return;
            }

            continentsCountries[continent] = [name];
            return;
        });

    return continentsCountries;
};
