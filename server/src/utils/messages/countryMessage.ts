import {Country, CountryMessage} from "../../models/country";
import {getCountriesByContinent} from "../../services/domain/countriesByContinent";
import {getActiveCases} from "./covid19Messages";
import {flag} from 'country-emoji';


const EXPLANATION_MESSAGE: string = 'To check country use: "/country [COUNTRY NAME]" template (Not case sensative)';

export const getShowCountriesMessage = (countries: Array<Country>): string => {
    const availableFor: string = `Available for ${countries.length} countries around the 🌍.`;
    const countriesList: string = Object.entries(getCountriesByContinent(countries))
        .map(
            ([continentName, countries]: [string, Array<string>]): string => `\n🗺️ ${continentName}, totally ${countries.length} countries\n`
                .concat(countries.join('; '))
        )
        .join('\n');
    const hint: string = `ℹ ${EXPLANATION_MESSAGE}, \n\nℹ i.e. /country ${countries[0].name}`;

    return availableFor
        .concat(`\n\n${countriesList}`)
        .concat(`\n\n${hint}`)
};

export const getTableRowMessageForCountry = ({
                                                 countryName,
                                                 totalConfirmed,
                                                 totalRecovered,
                                                 totalDeaths,
                                                 lastUpdateDate,
                                             }: CountryMessage): Array<string> =>
    [`${flag(countryName) ?? ''} ${countryName}`, `${getActiveCases(totalConfirmed, totalRecovered, totalDeaths)}`, `${totalRecovered}`, `${totalDeaths}`];

export const getTableHeader = (): Array<string> => ["Country", "Active", "Recovered", "Deaths"];

export const getMessageForCountry = ({
                                         countryName,
                                         totalConfirmed,
                                         totalRecovered,
                                         totalDeaths,
                                         lastUpdateDate,
                                     }: CountryMessage): string =>
    `${flag(countryName) ?? ''} ${countryName}, ${getActiveCases(totalConfirmed, totalRecovered, totalDeaths)} active, ${totalRecovered} recovered, ${totalDeaths} deaths. ⏱️${lastUpdateDate}`;