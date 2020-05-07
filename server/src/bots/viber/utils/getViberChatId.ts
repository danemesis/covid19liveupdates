import { ViberTextMessage } from '../models';

export const getViberChatId = (message: ViberTextMessage): string => {
    // Because due to user's ids - they might have shashes
    // And Firebase treat slash as the path, so ...
    return message.chat.id.replace('/', '^');
};

export const mapBackToRealViberChatId = (chatId: string): string =>
    chatId.replace('^', '/');
