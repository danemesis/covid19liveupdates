import { TelegramCallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getAdviceWithVideoMessage } from '../../../messages/feature/adviceMessages';

export const showAdvicesHowToBehaveResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        getAdviceWithVideoMessage(user.settings.locale),
        {
            parse_mode: 'HTML',
        }
    );
};
