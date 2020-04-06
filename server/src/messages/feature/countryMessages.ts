import {Country, CountryMessage} from "../../models/country.models";
import {getActiveCases} from "../covid19Messages";
import {flag} from 'country-emoji';
import {UserRegExps} from "../../models/constants";

export const getMessageForUserInputWithoutCountryName = (): string => `Sorry, but I can show country only by country name. Enter country name by following the pattern ${UserRegExps.CountryData} [country name]`;

export const getTableRowMessageForCountry = ({
                                                 name,
                                                 confirmed,
                                                 recovered,
                                                 deaths,
                                                 lastUpdateDate,
                                             }: CountryMessage): Array<string> =>
    [`${flag(name) ?? ''} ${name}`, `${getActiveCases(confirmed, recovered, deaths)}`, `${recovered}`, `${deaths}`];

export const getTableHeader = (): Array<string> => ["Country", "Act.🤧", "Recovered", "Deaths"];

export const getMessageForCountry = ({
                                         name,
                                         confirmed,
                                         recovered,
                                         deaths,
                                         lastUpdateDate,
                                     }: CountryMessage): string =>
    `${flag(name) ?? ''} ${name}, ${getActiveCases(confirmed, recovered, deaths)} active, ${recovered} recovered, ${deaths} deaths. ⏱️${lastUpdateDate}`;