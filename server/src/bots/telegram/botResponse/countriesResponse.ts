import {
    CountryActiveSituationInfo,
    CountrySituationInfo,
    WorldOverallInformation,
} from '../../../models/covid19.models';
import {
    getCountriesForContinentMessage,
    getCountriesTableHTMLMessage,
    getCountriesWorldMessage,
    getTableCountryRowMessage,
    getTableHeader,
} from '../../../messages/feature/countriesMessages';
import {
    getContinentsInlineKeyboard,
    getCountriesInlineKeyboard,
} from '../services/keyboard';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import {
    getContinentOverallInformation,
    getWorldOverallInformation,
} from '../../../services/domain/countries';
import * as TelegramBot from 'node-telegram-bot-api';

export const countriesForContinentResponse = async ({
    bot,
    user,
    chatId,
    commandParameter,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    const { countriesSituation } = await getContinentOverallInformation(
        commandParameter
    );

    const sortedCountriesSituation: Array<CountryActiveSituationInfo> = countriesSituation.sort(
        (country1, country2) => country2.active - country1.active
    );

    return bot.sendMessage(
        chatId,
        getCountriesForContinentMessage(user.settings?.locale),
        getCountriesInlineKeyboard(sortedCountriesSituation)
    );
};

export const countriesTableByContinentResponse = (continent) => async ({
    bot,
    user,
    chatId,
}: CallBackQueryParameters) => {
    const {
        confirmed,
        recovered,
        deaths,
        countriesSituation,
    } = await getContinentOverallInformation(continent);

    const portionMessage = [getTableHeader(user.settings?.locale)];
    portionMessage.push();

    const sortedCountriesSituation: Array<CountryActiveSituationInfo> = countriesSituation.sort(
        (country1, country2) => country2.active - country1.active
    );

    sortedCountriesSituation.forEach(({ name, active, recovered, deaths }) =>
        portionMessage.push(
            getTableCountryRowMessage(name, active, recovered, deaths)
        )
    );

    return bot.sendMessage(
        chatId,
        getCountriesTableHTMLMessage(
            user.settings?.locale,
            continent,
            confirmed,
            recovered,
            deaths,
            countriesSituation,
            portionMessage
        ),
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: getCountriesInlineKeyboard(
                    sortedCountriesSituation
                ),
            },
        }
    );
};

export const worldByContinentOverallResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: CallBackQueryParameters) => {
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
            user.settings?.locale,
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
