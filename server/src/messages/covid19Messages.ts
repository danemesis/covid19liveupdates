import { CountrySituationInfo } from '../models/covid19.models';
import { addNumberChangeSymbol } from '../utils/addNumberChangeSymbol';
import { getActiveCases } from '../services/domain/countries';
import { getLocalizedMessages } from '../services/domain/localization.service';

export const getDiffMessage = (
    locale: string | null,
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
    )} ${getLocalizedMessages(locale, 'active')}, ` +
    `${addNumberChangeSymbol(recovered - prevRecovered)} ${getLocalizedMessages(
        locale,
        'recovered'
    )}, ` +
    `${addNumberChangeSymbol(deaths - prevDeaths)} ${getLocalizedMessages(
        locale,
        'death'
    )}`;
