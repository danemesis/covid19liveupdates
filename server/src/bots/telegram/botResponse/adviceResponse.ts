import { TelegramCallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getAdviceMessage } from '../../../messages/feature/adviceMessages';

export const showAdvicesHowToBehaveResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}): Promise<TelegramBot.Message> => {
    return bot.sendMessage(chatId, getAdviceMessage(user.settings.locale), {
        parse_mode: 'HTML',
    });
};
