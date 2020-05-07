import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import {
    getContinentOverallInformation,
    getWorldOverallInformation,
} from '../../../services/domain/countries';
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
    vGetContinentCountriesCheckOutOfferMessageInlineKeyboard,
    vGetCountriesInlineKeyboard,
} from '../services/keyboard';
import { Message } from 'viber-bot';
import { Continents } from '../../../models/constants';
import { isTextEqual } from '../../../utils/isEqual';
import { mapBackToRealViberChatId } from '../utils/getViberChatId';

export const vCountriesTableByContinentResponse = (
    continent: string
) => async ({ bot, user, chatId }: ViberCallBackQueryParameters) => {
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

    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
            getCountriesTableHTMLMessage(
                user.settings?.locale,
                continent,
                confirmed,
                recovered,
                deaths,
                countriesSituation,
                portionMessage
            )
        ),
        new Message.Keyboard(
            vGetContinentCountriesCheckOutOfferMessageInlineKeyboard(
                user.settings?.locale,
                continent
            )
        ),
    ]);
};

export const vCountriesForContinentResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
    commandParameter,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const { countriesSituation } = await getContinentOverallInformation(
        commandParameter
    );

    const sortedCountriesSituation: Array<CountryActiveSituationInfo> = countriesSituation.sort(
        (country1, country2) => country2.active - country1.active
    );

    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
            getCountriesForContinentMessage(user.settings?.locale)
        ),
        new Message.Keyboard(
            vGetCountriesInlineKeyboard(sortedCountriesSituation)
        ),
    ]);
};

export const vWorldByContinentOverallResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
    message,
    commandParameter,
}: ViberCallBackQueryParameters) => {
    if (
        !!commandParameter &&
        Object.keys(Continents).some((continent) =>
            isTextEqual(continent, commandParameter)
        )
    ) {
        return vCountriesForContinentResponse({
            bot,
            user,
            chatId,
            message,
            commandParameter,
        });
    }

    const {
        confirmed,
        recovered,
        deaths,
        continentCountriesSituations,
    }: WorldOverallInformation = await getWorldOverallInformation();

    // Send overall world info,
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
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
            )
        ),
        new Message.Keyboard(getContinentsInlineKeyboard()),
    ]);
};
