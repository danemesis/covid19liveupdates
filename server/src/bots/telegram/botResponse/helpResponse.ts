import {getHelpMessage} from '../../../messages/feature/helpMessages';

export const showHelpInfoResponse = async (bot, message, chatId) => {
    return bot.sendMessage(
        chatId,
        getHelpMessage()
    );
};
