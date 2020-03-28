export const getActiveCases = (totalConfirmed: number,
                               totalRecovered: number,
                               totalDeaths: number): number =>
    totalConfirmed - totalRecovered - totalDeaths ?? 0;