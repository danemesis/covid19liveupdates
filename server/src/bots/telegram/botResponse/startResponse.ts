import {getFullMenuKeyboard} from '../utils/keyboard';
import {greetUser} from "../../../messages/userMessage";
import {showHelpInfoResponse} from './helpResponse';

export const startResponse = async (bot, message, chatId) => {
    await bot.sendMessage(
        message.chat.id,
        `${greetUser(message.from)}`,
        getFullMenuKeyboard(message)
    );

    await showHelpInfoResponse(bot, message, chatId);
};