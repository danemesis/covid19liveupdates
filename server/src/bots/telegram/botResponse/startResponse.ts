import {getFullMenuKeyboard} from '../services/keyboard';
import {greetUser} from '../../../messages/userMessage';
import {showHelpInfoResponse} from './helpResponse';

export const startResponse = async (bot, message, chatId) => {
    await bot.sendMessage(
        chatId,
        `${greetUser(message.from)}`,
        getFullMenuKeyboard(message)
    );

    await showHelpInfoResponse(bot, message, chatId);
};
