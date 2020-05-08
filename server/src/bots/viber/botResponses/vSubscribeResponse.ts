import {
    noSubscriptionsResponseMessage,
    showMySubscriptionMessage,
    subscriptionManagerResponseMessage,
    subscriptionResultMessage,
} from '../../../messages/feature/subscribeMessages';
import {
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { vGetSubscriptionMessageInlineKeyboard } from '../services/keyboard';
import { Message } from 'viber-bot';
import { viberStorage } from '../services/storage';
import { catchAsyncError } from '../../../utils/catchError';
import { subscribeOn } from '../../../services/domain/subscriptions';
import { getLocalizedMessages } from '../../../services/domain/localization.service';
import { mapBackToRealViberChatId } from '../utils/getViberChatId';

export const vSubscriptionManagerResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
            subscriptionManagerResponseMessage(user.settings?.locale)
        ),
        new Message.Keyboard(
            vGetSubscriptionMessageInlineKeyboard(user.settings?.locale)
        ),
    ]);
};

export const vShowExistingSubscriptionsResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    const activeUserSubscription = await viberStorage().getActiveUserSubscriptions(
        chatId
    );
    if (!activeUserSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
            new Message.Text(
                noSubscriptionsResponseMessage(user?.settings?.locale)
            ),
            new Message.Keyboard(
                vGetSubscriptionMessageInlineKeyboard(user.settings?.locale)
            ),
        ]);
    }

    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
            showMySubscriptionMessage(
                activeUserSubscription,
                user?.settings?.locale
            )
        ),
        new Message.Keyboard(
            vGetSubscriptionMessageInlineKeyboard(user.settings?.locale)
        ),
    ]);
};

export const vSubscribingStrategyResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
    commandParameter,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    if (!commandParameter) {
        return vShowExistingSubscriptionsResponse({
            bot,
            message,
            chatId,
            user,
        });
    }

    const [err, result] = await catchAsyncError<string>(
        subscribeOn(
            // Because due to user's ids - they might have shashes
            // And Firebase treat slash as the path, so ...
            { ...message.chat, id: chatId },
            user,
            commandParameter,
            viberStorage()
        )
    );
    if (err) {
        return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
            new Message.Text(
                getLocalizedMessages(
                    user?.settings?.locale,
                    'Something went wrong, sorry'
                )
            ),
            new Message.Keyboard(
                vGetSubscriptionMessageInlineKeyboard(user.settings?.locale)
            ),
        ]);
    }

    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
            subscriptionResultMessage(result, user?.settings?.locale)
        ),
        new Message.Keyboard(
            vGetSubscriptionMessageInlineKeyboard(user.settings?.locale)
        ),
    ]);
};
