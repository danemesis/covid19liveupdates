import {
    CountrySituationInfo,
    WorldOverallInformation,
} from '../../../models/covid19.models';
import {
    getCountriesTableHTML,
    getCountriesWorldMessage,
    getTableCountryRowMessage,
    getTableHeader,
} from '../../../messages/feature/countriesMessages';
import { getContinentsInlineKeyboard } from '../services/keyboard';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import {
    getContinentOverallInformation,
    getWorldOverallInformation,
} from '../../../services/domain/countries';

export const countriesByContinentResponse = (continent) => async (
    bot,
    message,
    chatId
) => {
    const {
        confirmed,
        recovered,
        deaths,
        countriesSituation,
    } = await getContinentOverallInformation(continent);

    const portionMessage = [getTableHeader()];
    portionMessage.push();

    countriesSituation
        .sort((country1, country2) => country2.active - country1.active)
        .forEach(({ name, active, recovered, deaths }) =>
            portionMessage.push(
                getTableCountryRowMessage(name, active, recovered, deaths)
            )
        );

    return bot.sendMessage(
        chatId,
        getCountriesTableHTML(
            continent,
            confirmed,
            recovered,
            deaths,
            countriesSituation,
            portionMessage
        ),
        { parse_mode: 'HTML' }
    );
};

export const countriesResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot,
    message,
    chatId
) => {
    const {
        confirmed,
        recovered,
        deaths,
        continentCountriesSituations,
    }: WorldOverallInformation = await getWorldOverallInformation();

    // Send overall world info,
    return bot.sendMessage(
        chatId,
        getCountriesWorldMessage(
            confirmed,
            recovered,
            deaths,
            Object.values(continentCountriesSituations).reduce(
                (acc: number, val: Array<CountrySituationInfo>): number =>
                    acc + val.length,
                0
            ) as number,
            Object.keys(continentCountriesSituations).length
        ),
        getContinentsInlineKeyboard()
    );
};
