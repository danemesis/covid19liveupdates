export const getActiveCases = (totalConfirmed: number,
                               totalRecovered: number,
                               totalDeaths: number): number =>
    totalConfirmed - totalRecovered - totalDeaths ?? 0;

export const getMessageForCountry = (countryName: string,
                                     totalConfirmed: number,
                                     totalRecovered: number,
                                     totalDeaths: number,
                                     lastUpdateDate): string =>
    `${countryName} has active cases: ${getActiveCases(totalConfirmed, totalRecovered, totalDeaths)}. ${totalRecovered} recovered, ${totalDeaths} deaths. Last update: ${lastUpdateDate}`;