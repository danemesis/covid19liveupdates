import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { Message } from 'viber-bot';
import { getCloseActionMessage } from '../../../messages/feature/actionsMessages';

export const vActionsResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: chatId }, [
        new Message.Text(getCloseActionMessage(user.settings?.locale)),
    ]);
};
