import { isMessageStartsWithCommand } from './incomingMessages';

export const removeCommandFromMessageIfExist = (
    message: string,
    command: string
): string => {
    if (!isMessageStartsWithCommand(message)) {
        return message;
    }

    return message.includes(command)
        ? message.replace(command, '').trim()
        : message;
};
