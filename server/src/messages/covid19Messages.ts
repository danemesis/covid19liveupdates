import {CountrySituationInfo} from '../models/covid19.models';
import {addNumberChangeSymbol} from '../utils/addNumberChangeSymbol';

export const getActiveCases = (totalConfirmed: number,
                               totalRecovered: number,
                               totalDeaths: number): number =>
    totalConfirmed - totalRecovered - totalDeaths ?? 0;

export const getDiffMessage = (
    {confirmed, recovered, deaths}: Partial<CountrySituationInfo>,
    {confirmed: prevConfirmed, recovered: prevRecovered, deaths: prevDeaths}: Partial<CountrySituationInfo>
): string =>
    `${addNumberChangeSymbol(getActiveCases(confirmed, recovered, deaths) - getActiveCases(prevConfirmed, prevRecovered, prevDeaths))} active, `
    + `${addNumberChangeSymbol(recovered - prevRecovered)} recovered, `
    + `${addNumberChangeSymbol(deaths - prevDeaths)} death`;
