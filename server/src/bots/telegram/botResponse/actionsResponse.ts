import { CallBackQueryHandlerWithCommandArgument, CallBackQueryParameters } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getLocalizedMessage } from '../../../services/domain/localization.service';
import { DEFAULT_LOCALE } from '../../../models/constants';
import { getCloseActionMessage } from '../../../messages/feature/actionsMessages';
import { telegramUserService } from '../services/user';

export const closeActionResponse: CallBackQueryHandlerWithCommandArgument = async ({
                                                                                       bot,
                                                                                       user,
                                                                                       message,
                                                                                       messageHandlerRegistry,
                                                                                       chatId,
                                                                                   }: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    const closeActionMessage = await bot.sendMessage(
        chatId,
        getLocalizedMessage(
            user.settings?.locale ?? DEFAULT_LOCALE,
            [getCloseActionMessage()],
        ),
    );

    const userInterruptedCommand: string = user.state.interruptedCommand;
    if (userInterruptedCommand) {
        telegramUserService.setUserInterruptedCommand(
            user,
            null,
        );

        return messageHandlerRegistry.runCommandHandler({
            ...message,
            text: user.state.interruptedCommand,
        });
    }

    return closeActionMessage;
};
