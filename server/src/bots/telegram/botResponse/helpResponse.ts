import {getHelpMessage} from "../../../messages/feature/helpMessages";


export const showHelpInfo = async (bot, message, chatId) => {
    return bot.sendMessage(
        chatId,
        getHelpMessage()
    );
};