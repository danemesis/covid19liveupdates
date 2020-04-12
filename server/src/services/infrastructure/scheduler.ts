import * as schedule from 'node-schedule';
import {tryToUpdateCovid19Cache} from '../domain/covid19';
import {logger} from '../../utils/logger';

export const checkCovid19Updates = () => {
    // Check covid19 info every hour (at hh:30 mins, e.g. 1:30, 2:30 ...)
    schedule.scheduleJob('30 * * * *',  () => {
        tryToUpdateCovid19Cache()
            .then(() => logger.log('info', 'Covid19 cache updated'));
    });
};
