import { getCovidTrends } from '../../../services/api/api-chart';
import { addDays, Now } from '../../../utils/dateUtils';
import { CountrySituationInfo } from '../../../models/covid19.models';
import {
    enrichWithTitle,
    enrichWithType,
    Transform,
} from '../../../services/domain/chart';
import { catchAsyncError } from '../../../utils/catchError';
import { getRequestedCountry } from '../../../services/domain/countries';
import { logger } from '../../../utils/logger';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParametersWithTwoArguments,
    ViberTextMessage,
} from '../models';
import { Frequency } from './../../../models/constants';
import { getLocalizedMessages } from '../../../services/domain/localization.service';
import { Status } from '../../../models/constants';
import { Message } from 'viber-bot';
import { vGetAfterCountryResponseInlineKeyboard } from '../services/keyboard';
import * as shortUrl from 'node-url-shortener';
import { mapBackToRealViberChatId } from '../utils/getViberChatId';

export const vTrendsByCountryResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
    commandParameter: requestedCountry,
    secondCommandParameter: requestedFrequency,
}: ViberCallBackQueryParametersWithTwoArguments): Promise<ViberTextMessage> => {
    const frequency = requestedFrequency || Frequency.Weekly;

    const [err, [foundCountry, foundSituation]] = await catchAsyncError(
        getRequestedCountry(requestedCountry)
    );
    if (err) {
        logger.error(
            `Error ocured while trying to get requested country ${requestedCountry}`,
            err
        );

        return bot.sendMessage(
            { id: mapBackToRealViberChatId(chatId) },
            new Message.Text(err.message)
        );
    }

    let startDate: Date;
    let hasFilter = true;
    switch (frequency) {
        case Frequency.Weekly:
            startDate = addDays(Now, -7);
            break;
        case Frequency.Monthly:
            startDate = addDays(Now, -30);
            break;
        case Frequency.WholePeriod:
            hasFilter = false;
            break;
    }

    let periodSituation = foundSituation;
    if (hasFilter) {
        periodSituation = periodSituation.filter((c: CountrySituationInfo) => {
            const date = new Date(c.date);
            return date < Now && date > startDate;
        });
    }

    const frequencyName =
        frequency === Frequency.WholePeriod
            ? 'Whole period'
            : capitalize(frequency);

    const statuses = {};
    statuses[Status.Confirmed] = getLocalizedMessages(
        user.settings?.locale,
        Status.Confirmed
    );
    statuses[Status.Deaths] = getLocalizedMessages(
        user.settings?.locale,
        Status.Deaths
    );
    statuses[Status.Recovered] = getLocalizedMessages(
        user.settings?.locale,
        Status.Recovered
    );
    let model = enrichWithTitle(
        Transform(periodSituation, statuses),
        [
            getLocalizedMessages(user.settings?.locale, frequencyName),
            getLocalizedMessages(user.settings?.locale, 'trends for'),
            capitalize(
                getLocalizedMessages(user.settings?.locale, requestedCountry)
            ),
        ].join(' ')
    );
    if (frequency === Frequency.Weekly) {
        model = enrichWithType(model, 'barStacked');
    }

    const trendsUrl = getCovidTrends(model);
    // https://developers.viber.com/docs/all/#picture-message
    // Limit is 2048
    if (trendsUrl.length > 2048) {
        shortUrl.short(trendsUrl, async (err, url) => {
            const [error, result] = await catchAsyncError(
                bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
                    new Message.Picture(url),
                    new Message.Keyboard(
                        vGetAfterCountryResponseInlineKeyboard(
                            requestedCountry,
                            user.settings?.locale
                        )
                    ),
                ])
            );

            if (error) {
                bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
                    new Message.Keyboard(
                        vGetAfterCountryResponseInlineKeyboard(
                            requestedCountry,
                            user.settings?.locale
                        )
                    ),
                ]);

                return;
            }

            return result;
        });

        return;
    }
    const [error, result] = await catchAsyncError(
        bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
            new Message.Picture(trendsUrl),
            new Message.Keyboard(
                vGetAfterCountryResponseInlineKeyboard(
                    requestedCountry,
                    user.settings?.locale
                )
            ),
        ])
    );

    if (error) {
        return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
            new Message.Keyboard(
                vGetAfterCountryResponseInlineKeyboard(
                    requestedCountry,
                    user.settings?.locale
                )
            ),
        ]);
    }

    return result;
};

const capitalize = (input: string): string =>
    input.charAt(0).toUpperCase() + input.substring(1).toLowerCase();
