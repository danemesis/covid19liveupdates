import {
    getCountryIKActionMessage,
    getCountryMessage,
    getUserInputWithoutCountryNameMessage,
} from '../../../messages/feature/countryMessages';
import { Cache } from '../../../services/domain/cache';
import { flag, name } from 'country-emoji';
import {
    getAfterCountryResponseInlineKeyboard,
    getFullMenuKeyboard,
} from '../services/keyboard';
import {
    TelegramCallBackQueryHandlerWithCommandArgument,
    TelegramCallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import { Country } from '../../../models/country.models';
import { CountrySituationInfo } from '../../../models/covid19.models';
import {
    getCountryNameFormat,
    getRequestedCountry,
} from '../../../services/domain/countries';
import { LogCategory } from '../../../models/constants';

export const showCountryByNameStrategyResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
    commandParameter,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    if (!commandParameter) {
        return bot.sendMessage(
            chatId,
            getUserInputWithoutCountryNameMessage(user.settings?.locale)
        );
    }

    return showCountryResponse({
        bot,
        message,
        chatId,
        user,
        commandParameter: getCountryNameFormat(commandParameter),
    });
};

export const showCountryByFlag: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    const countryFlag = message.text;
    if (
        !countryFlag ||
        // Because of
        // [https://github.com/danbilokha/covid19liveupdates/issues/61]
        // fix of https://github.com/danbilokha/covid19liveupdates/issues/58
        // Reason, when we click on some Dashboard,
        //      MessageRegistry.registerMessageHandler this._bot.onText(
        // Regexp works not as we expect it to work
        // Theoretically should be fixed with https://github.com/danbilokha/covid19liveupdates/issues/49
        !getCountryNameFormat(name(countryFlag))
    ) {
        return bot.sendMessage(
            chatId,
            getUserInputWithoutCountryNameMessage(user.settings?.locale)
        );
    }

    return showCountryResponse({
        bot,
        message,
        chatId,
        user,
        commandParameter: getCountryNameFormat(name(countryFlag)),
    });
};

export const showCountryResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
    commandParameter: requestedCountry,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
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

        return bot.sendMessage(chatId, err.message);
    }

    const [{ name }, foundSituation] = result;
    Cache.set(`${chatId}_commands_country`, flag(name));

    const { recovered, confirmed, deaths, date } = foundSituation[
        foundSituation.length - 1
    ];
    // two send messages due to https://stackoverflow.com/a/41841237/6803463
    await bot.sendMessage(
        chatId,
        getCountryMessage(
            user.settings?.locale,
            name,
            confirmed,
            recovered,
            deaths,
            date
        ),
        getFullMenuKeyboard(chatId, user.settings?.locale)
    );
    return bot.sendMessage(
        chatId,
        getCountryIKActionMessage(user.settings?.locale, name),
        getAfterCountryResponseInlineKeyboard(name, user.settings?.locale)
    );
};
