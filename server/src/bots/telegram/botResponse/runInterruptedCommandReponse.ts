import * as TelegramBot from 'node-telegram-bot-api';
import { telegramUserService } from '../services/user';

export const runInterruptedCommandResponse = async ({
    message,
    user,
    messageHandlerRegistry,
}): Promise<TelegramBot.Message | null> => {
    if (user.state.interruptedCommand) {
        telegramUserService.setUserInterruptedCommand(user, null);

        return messageHandlerRegistry.runCommandHandler({
            ...message,
            text: user.state.interruptedCommand,
        });
    }

    return null;
};
