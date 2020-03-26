import {flag} from 'country-emoji';

export const getActiveCases = (totalConfirmed: number,
                               totalRecovered: number,
                               totalDeaths: number): number =>
    totalConfirmed - totalRecovered - totalDeaths ?? 0;

export const getSimplifiedMessageForCountry = (countryName: string,
                                               totalConfirmed: number,
                                               totalRecovered: number,
                                               totalDeaths: number,
                                               lastUpdateDate): string =>
    `${flag(countryName)} ${countryName}, ${getActiveCases(totalConfirmed, totalRecovered, totalDeaths)} active, ${totalRecovered} recovered, ${totalDeaths} deaths, on ${lastUpdateDate}`;

export const getMessageForCountry = (countryName: string,
                                     totalConfirmed: number,
                                     totalRecovered: number,
                                     totalDeaths: number,
                                     lastUpdateDate): string =>
    `${flag(countryName)} ${countryName}, ${getActiveCases(totalConfirmed, totalRecovered, totalDeaths)} active, ${totalRecovered} recovered, ${totalDeaths} deaths. ⏱️${lastUpdateDate}`;