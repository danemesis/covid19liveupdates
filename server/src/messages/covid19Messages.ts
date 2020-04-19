import { CountrySituationInfo } from '../models/covid19.models';
import { addNumberChangeSymbol } from '../utils/addNumberChangeSymbol';
import { getActiveCases } from '../services/domain/countries';

export const getDiffMessage = (
    { confirmed, recovered, deaths }: Partial<CountrySituationInfo>,
    {
        confirmed: prevConfirmed,
        recovered: prevRecovered,
        deaths: prevDeaths,
    }: Partial<CountrySituationInfo>
): string =>
    `${addNumberChangeSymbol(
        getActiveCases(confirmed, recovered, deaths) -
            getActiveCases(prevConfirmed, prevRecovered, prevDeaths)
    )} active, ` +
    `${addNumberChangeSymbol(recovered - prevRecovered)} recovered, ` +
    `${addNumberChangeSymbol(deaths - prevDeaths)} death`;
