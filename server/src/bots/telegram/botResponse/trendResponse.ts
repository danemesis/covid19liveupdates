import { getCovidTrends } from '../../../services/api/api-chart';
import { addDays, Now } from '../../../utils/dateUtils';
import { CountrySituationInfo } from '../../../models/covid19.models';
import { Transform } from '../../../services/domain/chart';
import { catchAsyncError } from '../../../utils/catchError';
import { getRequestedCountry } from '../../../services/domain/countries';
import { logger } from '../../../utils/logger';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const trendsByCountryResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    requestedCountry?: string | undefined
): Promise<TelegramBot.Message> => {
    const [err, [foundCountry, foundSituation]] = await catchAsyncError(
        getRequestedCountry(requestedCountry)
    );
    if (err) {
        logger.error(
            `Error ocured while trying to get requested country ${requestedCountry}`,
            err);

        return bot.sendMessage(chatId, err.message);
    }
    const lastWeekSituation = foundSituation.filter(
        (c: CountrySituationInfo) => {
            const date = new Date(c.date);
            return date < Now && date > addDays(Now, -7);
        }
    );

    return bot.sendPhoto(chatId, getCovidTrends(Transform(lastWeekSituation)));
};
