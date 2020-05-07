import { noSubscriptionsResponseMessage } from '../../../messages/feature/subscribeMessages';
import { getLocalizedMessages } from '../../../services/domain/localization.service';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { viberStorage } from '../services/storage';
import { Message } from 'viber-bot';
import {
    vGetFullMenuKeyboard,
    vGetUnsubscribeMessageInlineKeyboard,
} from '../services/keyboard';
import { catchAsyncError } from '../../../utils/catchError';
import { unsubscribeMeFrom } from '../../../services/domain/subscriptions';

export const buildUnsubscribeInlineResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const userSubscription = await viberStorage().getActiveUserSubscriptions(
        chatId
    );
    if (!userSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(
            { id: chatId },
            new Message.Text(
                noSubscriptionsResponseMessage(user.settings.locale)
            )
        );
    }

    return bot.sendMessage({ id: chatId }, [
        new Message.Text(
            getLocalizedMessages(
                user.settings.locale,
                'Choose items to unsubscribe from'
            )
        ),
        new Message.Keyboard(
            vGetUnsubscribeMessageInlineKeyboard(
                userSubscription.subscriptionsOn.map((v) => v.value)
            )
        ),
    ]);
};

export const vUnsubscribeStrategyResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    user,
    chatId,
    commandParameter,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    if (!commandParameter) {
        return buildUnsubscribeInlineResponse({ bot, message, chatId, user });
    }

    const [err, result] = await catchAsyncError<string>(
        unsubscribeMeFrom(message.chat, commandParameter, viberStorage())
    );
    if (err) {
        return bot.sendMessage({ id: chatId }, [
            new Message.Text(`${err.message}, sorry 🙇🏽`),
        ]);
    }

    return bot.sendMessage({ id: chatId }, [
        new Message.Text(
            getLocalizedMessages(
                user.settings?.locale,
                'You have been unsubscribed from'
            ) + result
        ),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};
