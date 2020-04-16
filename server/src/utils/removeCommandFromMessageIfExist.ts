import {isMessageStartsWithCommand} from './incomingMessages';
import {getInfoMessage} from './getLoggerMessages';
import {logger} from './logger';
import {LogglyTypes} from '../models/loggly.models';

export const removeCommandFromMessageIfExist = (message: string, command: string): string => {
    if (!isMessageStartsWithCommand(message)) {
        logger.log(
            'info',
            {
                type: LogglyTypes.RemoveCommandFromMessageIfExistInfo,
                message: `${getInfoMessage(`Cannot remove command from ${message}`)}`,
            }
        );
        return message;
    }

    return message.includes(command)
        ? message.replace(command, '').trim()
        : message;
};
