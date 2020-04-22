import { getCovidTrends } from '../../../services/api/api-chart';
import { addDays, Now } from '../../../utils/dateUtils';
import { CountrySituationInfo } from '../../../models/covid19.models';
import {
    Transform,
    enrichWithTitle,
    enrichWithType,
} from '../../../services/domain/chart';
import { catchAsyncError } from '../../../utils/catchError';
import { getRequestedCountry } from '../../../services/domain/countries';
import { logger } from '../../../utils/logger';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { Frequency } from './../../../models/constants';

export const trendsByCountryResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    requestedCountry?: string | undefined,
    requestedFrequency?: Frequency | undefined
): Promise<TelegramBot.Message> => {
    const ferequency = requestedFrequency || Frequency.Weekly;

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
    switch (ferequency) {
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
        ferequency === Frequency.WholePeriod
            ? 'Whole period'
            : capitalize(ferequency);

    let model = enrichWithTitle(
        Transform(periodSituation),
        `${frequencyName} trends for ${capitalize(requestedCountry)}`
    );
    if (ferequency === Frequency.Weekly) {
        model = enrichWithType(model, 'barStacked');
    }

    return bot.sendPhoto(chatId, getCovidTrends(model));
};

const capitalize = (input: string): string =>
    input.charAt(0).toUpperCase() + input.substring(1).toLowerCase();
