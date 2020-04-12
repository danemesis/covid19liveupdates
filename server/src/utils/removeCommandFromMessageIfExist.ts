import {isMessageStartsWithCommand} from "./incomingMessages";
import {getInfoMessage} from "./getLoggerMessages";
import {logger} from "./logger";

export const removeCommandFromMessageIfExist = (message: string, command: string): string => {
    if (!isMessageStartsWithCommand(message)) {
        logger.log(
            'info',
            `${getInfoMessage(`Cannot remove command from ${message}`)}`
        );
        return message;
    }

    return message.includes(command)
        ? message.replace(command, '').trim()
        : message;
};
