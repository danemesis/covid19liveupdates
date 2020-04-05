import {getKeyboard} from '../utils/keyboard';
import {greetUser} from "../../../utils/messages/userMessage";
import {showHelpInfo} from './helpResponse';

export const startResponse = async (bot, message, chatId) => {
    await bot.sendMessage(
        message.chat.id,
        `${greetUser(message.from)}`,
        getKeyboard(message)
    );

    await showHelpInfo(bot, message, chatId);
};