import * as schedule from 'node-schedule';
import { tryToUpdateCovid19Cache } from '../domain/covid19';
import { logger } from '../../utils/logger';
import { LogCategory } from '../../models/constants';
import {
    getTelegramAllUsers,
    getTelegramNotificationMessage,
} from '../../bots/telegram/services/storage';
import { catchAsyncError } from '../../utils/catchError';
import TelegramBot = require('node-telegram-bot-api');
import environments from '../../environments/environment';
import { getUserName } from '../../utils/user.utils';

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

export const runSendScheduledNotificationToUsersJob = async (
    bot: TelegramBot
): Promise<void> => {
    // At 08:00 PM, every day
    schedule.scheduleJob(
        environments.features.ScheduledNotification.cronExpr || '0 0 20 * * *',
        async () => {
            if (!environments.features.ScheduledNotification.enabled) {
                logger.log(
                    'info',
                    'SchedulerNotification was launched, but currently disabled',
                    LogCategory.Scheduler
                );
                return;
            }
            const [err, users] = await catchAsyncError(getTelegramAllUsers());
            if (err) {
                logger.error(
                    'sendReleaseNotificationToUsers failed when accessing users Db',
                    err,
                    LogCategory.Scheduler
                );
                return;
            }
            const [err1, message] = await catchAsyncError(
                getTelegramNotificationMessage()
            );
            if (err) {
                logger.error(
                    'sendReleaseNotificationToUsers failed when accessing getTelegramNotificationMessage()',
                    err,
                    LogCategory.Scheduler
                );
                return;
            }
            if (!message) {
                logger.error(
                    'getTelegramNotificationMessage() returns empty message',
                    err,
                    LogCategory.Scheduler
                );
            }

            for (const usr of users) {
                message.replace('#UserName#', getUserName(usr));
                bot.sendMessage(usr.chatId, message);
            }
        }
    );
};
