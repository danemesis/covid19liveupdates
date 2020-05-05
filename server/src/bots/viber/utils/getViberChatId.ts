import { ViberTextMessage } from '../models';

export const getViberChatId = (message: ViberTextMessage): string => {
    return message.chat.id;
};
