import {
    getCountryMessage,
    getUserInputWithoutCountryNameMessage,
} from '../../../messages/feature/countryMessages';
import {
    getCountryNameFormat,
    getRequestedCountry,
} from '../../../services/domain/countries';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { Country } from '../../../models/country.models';
import { CountrySituationInfo } from '../../../models/covid19.models';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import { LogCategory } from '../../../models/constants';
import { vGetAfterCountryResponseInlineKeyboard } from '../services/keyboard';

export const vShowCountryByNameStrategyResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
    commandParameter,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    if (!commandParameter) {
        return bot.sendMessage(
            { id: chatId },
            new Message.Text(
                getUserInputWithoutCountryNameMessage(user.settings?.locale)
            )
        );
    }

    return vShowCountryResponse({
        bot,
        message,
        chatId,
        user,
        commandParameter: getCountryNameFormat(commandParameter),
    });
};

export const vShowCountryResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
    commandParameter: requestedCountry,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const [err, result]: [
        Error,
        [Country, Array<CountrySituationInfo>]
    ] = await catchAsyncError<[Country, Array<CountrySituationInfo>]>(
        getRequestedCountry(requestedCountry)
    );
    if (err) {
        logger.error(
            `Error ocured while getting response for Country ${requestedCountry}`,
            err,
            LogCategory.Countries,
            chatId
        );

        return bot.sendMessage({ id: chatId }, new Message.Text(err.message));
    }

    const [{ name }, foundSituation] = result;
    const { recovered, confirmed, deaths, date } = foundSituation[
        foundSituation.length - 1
    ];
    return bot.sendMessage({ id: chatId }, [
        new Message.Text(
            getCountryMessage(
                user.settings?.locale,
                name,
                confirmed,
                recovered,
                deaths,
                date
            )
        ),
        new Message.Keyboard(
            vGetAfterCountryResponseInlineKeyboard(name, user.settings?.locale)
        ),
    ]);
};
