import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { LogCategory } from '../../../../models/constants';
import { logger } from '../../../../utils/logger';
import { noResponse } from '../../botResponse/noResponse';
import { MessageHandlerRegistry } from './messageHandlerRegistry';

/**
 * This function is wrapper around the original User's query handler
 * It adds an additional two parameters (if such exists) to original handler,
 * which will be parameters following after command
 * @example /trends Ukraine monthly
 */
export const withTwoArgumentsAfterCommand = (
    context: MessageHandlerRegistry,
    handlerFn: CallBackQueryHandlerWithCommandArgument
): CallBackQueryHandlerWithCommandArgument => {
    return ({
        bot,
        message,
        chatId,
        user,
        commandParameter,
    }: CallBackQueryParameters): Promise<TelegramBot.Message> => {
        try {
            const [arg1, arg2] = splitArgument(commandParameter);
            return handlerFn.call(context, {
                bot,
                message,
                user,
                chatId,
                commandParameter:
                    (arg1 && arg1.toLowerCase()) || commandParameter,
                secondCommandParameter: arg2 && arg2.toLowerCase(),
            });
        } catch (err) {
            logger.error(
                `Error happend inside withTwoArgumentsAfterCommand() for ${chatId} with message: ${message.text} and commandParameter: ${commandParameter}`,
                err,
                LogCategory.Command,
                chatId
            );

            return noResponse({ bot, message, user, chatId });
        }
    };
};

const splitArgsRegexp = new RegExp(
    '"(?<firstArg>.+)"[\\s.,;]+(?<secondArg>[^ ]+)'
);

function splitArgument(argument: string): [string, string] {
    const match = splitArgsRegexp.exec(argument);
    if (!match) {
        return [undefined, undefined];
    }

    /* tslint:disable:no-string-literal */
    return [match.groups['firstArg'], match.groups['secondArg']];
}
