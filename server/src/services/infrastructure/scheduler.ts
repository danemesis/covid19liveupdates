import * as schedule from 'node-schedule';
import { tryToUpdateCovid19Cache } from '../domain/covid19';
import { logger } from '../../utils/logger';
import { LogCategory } from '../../models/constants';
import { getTelegramAllUsers } from '../../bots/telegram/services/storage';
import { catchAsyncError } from '../../utils/catchError';
import TelegramBot = require('node-telegram-bot-api');

export const checkCovid19Updates = () => {
    // Check covid19 info every hour (at hh:30 mins, e.g. 1:30, 2:30 ...)
    schedule.scheduleJob('30 * * * *', () => {
        tryToUpdateCovid19Cache().then(() =>
            logger.log('info', {
                type: LogCategory.Covid19DataUpdate,
                message: 'Covid19 cache updated',
            })
        );
    });
};

export const sendReleaseNotificationToUsers = async (bot: TelegramBot) => {
    // At 08:00 PM, only on Monday
    schedule.scheduleJob('0 0 20 * * 1', async () => {
        const [err, users] = await catchAsyncError(getTelegramAllUsers());
        if (err) {
            logger.error(
                'sendReleaseNotificationToUsers failed when accessing users Db',
                err,
                LogCategory.Scheduler
            );
            return;
        }

        for (const usr of users) {
            bot.sendMessage(usr.chatId, 'Hello DUDE, What\'s UP? ');
        }
    });
};
