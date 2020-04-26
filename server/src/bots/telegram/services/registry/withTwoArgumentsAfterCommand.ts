import { CallBackQueryHandlerWithCommandArgument, CallBackQueryParameters } from '../../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { LogCategory } from '../../../../models/constants';
import { logger } from '../../../../utils/logger';
import { noResponse } from '../../botResponse/noResponse';

export const withTwoArgumentsAfterCommand = (
    handlerFn: CallBackQueryHandlerWithCommandArgument,
): CallBackQueryHandlerWithCommandArgument => {
    return ({
                bot,
                message,
                chatId,
                user,
                messageHandlerRegistry,
                commandParameter,
            }: CallBackQueryParameters): Promise<TelegramBot.Message> => {
        try {
            const [arg1, arg2] = splitArgument(commandParameter);
            return handlerFn.call(messageHandlerRegistry, {
                bot,
                message,
                chatId,
                messageHandlerRegistry,
                commandParameter:
                    (arg1 && arg1.toLowerCase()) || commandParameter,
                secondCommandParameter: arg2 && arg2.toLowerCase(),
            });
        } catch (err) {
            logger.error(
                `Error happend inside withTwoArgumentsAfterCommand() for ${chatId} with message: ${message.text} and ikCbData: ${ikCbData}`,
                err,
                LogCategory.Command,
                chatId,
            );

            return noResponse({ bot, message, user, chatId, messageHandlerRegistry });
        }
    };
};

const splitArgsRegexp = new RegExp(
    '(?<firstArg>[^ ]+)[\\s.,;]+(?<secondArg>[^ ]+)',
);

function splitArgument(argument: string): [string, string] {
    const match = splitArgsRegexp.exec(argument);
    if (!match) {
        return [undefined, undefined];
    }

    /* tslint:disable:no-string-literal */
    return [match.groups['firstArg'], match.groups['secondArg']];
}
