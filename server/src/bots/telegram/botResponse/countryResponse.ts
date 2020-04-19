import { adaptCountryToSystemRepresentation } from '../../../services/domain/covid19';
import {
    getCountryIKActionMessage,
    getCountryMessage,
    getUserInputWithoutCountryNameMessage,
} from '../../../messages/feature/countryMessages';
import { Cache } from '../../../utils/cache';
import { flag, name } from 'country-emoji';
import {
    getAfterCountryResponseInlineKeyboard,
    getFullMenuKeyboard,
} from '../services/keyboard';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getRequestedCountry } from '../../../services/domain/countries';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import { getErrorMessage } from '../../../utils/getErrorMessages';

export const showCountryByNameStrategyResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    parameterAfterCommand?: string
): Promise<TelegramBot.Message> => {
    if (!parameterAfterCommand) {
        return bot.sendMessage(chatId, getUserInputWithoutCountryNameMessage());
    }

    return showCountryResponse(
        bot,
        message,
        chatId,
        adaptCountryToSystemRepresentation(parameterAfterCommand)
    );
};

export const showCountryByFlag: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    parameterAfterCommand?: string
): Promise<TelegramBot.Message> => {
    if (
        !parameterAfterCommand ||
        // Because of
        // [https://github.com/danbilokha/covid19liveupdates/issues/61]
        // fix of https://github.com/danbilokha/covid19liveupdates/issues/58
        // Reason, when we click on some Dashboard,
        //      MessageRegistry.registerMessageHandler this._bot.onText(
        // Regexp works not as we expect it to work
        // Theoretically should be fixed with https://github.com/danbilokha/covid19liveupdates/issues/49
        !adaptCountryToSystemRepresentation(name(parameterAfterCommand))
    ) {
        return bot.sendMessage(chatId, getUserInputWithoutCountryNameMessage());
    }

    return showCountryResponse(
        bot,
        message,
        chatId,
        adaptCountryToSystemRepresentation(name(parameterAfterCommand))
    );
};

export const showCountryResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    requestedCountry: string
): Promise<TelegramBot.Message> => {
    const [err, result] = await catchAsyncError(
        getRequestedCountry(requestedCountry)
    );
    if (err) {
        logger.log('error', getErrorMessage(err));
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
        getCountryMessage({
            name,
            confirmed,
            recovered,
            deaths,
            lastUpdateDate: date,
        }),
        getFullMenuKeyboard(chatId)
    );
    return bot.sendMessage(
        chatId,
        getCountryIKActionMessage(name),
        getAfterCountryResponseInlineKeyboard(name)
    );
};
