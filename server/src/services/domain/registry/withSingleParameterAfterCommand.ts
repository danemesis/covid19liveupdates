import { logger } from '../../../utils/logger';
import { getParameterAfterCommandFromMessage } from './getParameterAfterCommandFromMessage';
import { LogCategory } from '../../../models/constants';
import { MessageRegistry } from './messageRegistry';
import {
    Bot,
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
    Message,
} from '../../../models/bots';

/**
 * This function is wrapper around the original User's query handler
 * It adds an additional parameter (if such exist) to original handler,
 * which will be an parameter following after command
 * * @example /country Ukraine
 */
export const withSingleParameterAfterCommand = (
    context: MessageRegistry,
    handlerFn: CallBackQueryHandlerWithCommandArgument,
    noResponseFn: (args: unknown) => Promise<Message>
): CallBackQueryHandlerWithCommandArgument => {
    return ({
        bot,
        message,
        chatId,
        user,
        commandParameter,
    }: CallBackQueryParameters<Bot, Message>): Promise<Message> => {
        try {
            const userEnteredArgumentAfterCommand: string = getParameterAfterCommandFromMessage(
                context.singleParameterAfterCommands,
                (commandParameter ?? message.text).toLocaleLowerCase()
            );

            return handlerFn.call(context, {
                bot,
                message,
                chatId,
                user,
                commandParameter: userEnteredArgumentAfterCommand,
            });
        } catch (err) {
            logger.error(
                `Error happend inside withSingleParameterAfterCommand() for ${chatId} with message: ${message.text} and commandParameter: ${commandParameter}`,
                err,
                LogCategory.Command,
                chatId
            );

            return noResponseFn({ bot, message, chatId, user });
        }
    };
};
