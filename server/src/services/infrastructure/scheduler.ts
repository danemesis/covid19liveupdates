import * as schedule from 'node-schedule';
import { tryToUpdateCovid19Cache } from '../domain/covid19';
import { logger } from '../../utils/logger';
import { LogglyTypes } from '../../models/loggly.models';

export const checkCovid19Updates = () => {
    // Check covid19 info every hour (at hh:30 mins, e.g. 1:30, 2:30 ...)
    schedule.scheduleJob('30 * * * *', () => {
        tryToUpdateCovid19Cache().then(() =>
            logger.log('info', {
                type: LogglyTypes.Covid19DataUpdateInfo,
                message: 'Covid19 cache updated',
            })
        );
    });
};
