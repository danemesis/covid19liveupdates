import {getKeyboard} from '../utils/keyboard';
import {greetUser} from "../../../messages/userMessage";
import {showHelpInfoResponse} from './helpResponse';

export const startResponse = async (bot, message, chatId) => {
    await bot.sendMessage(
        message.chat.id,
        `${greetUser(message.from)}`,
        getKeyboard(message)
    );

    await showHelpInfoResponse(bot, message, chatId);
};