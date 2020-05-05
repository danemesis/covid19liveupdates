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
import { TelegramCallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { Frequency } from './../../../models/constants';
import { getLocalizedMessages } from '../../../services/domain/localization.service';
import { Status } from '../../../models/constants';

export const trendsByCountryResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
    commandParameter: requestedCountry,
    secondCommandParameter: requestedFrequency,
}): Promise<TelegramBot.Message> => {
    const frequency = requestedFrequency || Frequency.Weekly;

    const [err, [foundCountry, foundSituation]] = await catchAsyncError(
        getRequestedCountry(requestedCountry)
    );
    if (err) {
        logger.error(
            `Error ocured while trying to get requested country ${requestedCountry}`,
            err
        );

        return bot.sendMessage(chatId, err.message);
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

    return bot.sendPhoto(chatId, getCovidTrends(model));
};

const capitalize = (input: string): string =>
    input.charAt(0).toUpperCase() + input.substring(1).toLowerCase();
