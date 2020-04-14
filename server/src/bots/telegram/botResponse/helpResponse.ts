import {getHelpMessage} from '../../../messages/feature/helpMessages';
import {CallBackQueryHandler} from '../models';

export const showHelpInfoResponse: CallBackQueryHandler = async (
    bot,
    message,
    chatId
) => {
    return bot.sendMessage(
        chatId,
        getHelpMessage()
    );
};
