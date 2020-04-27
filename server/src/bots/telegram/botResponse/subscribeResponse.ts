import {
    noSubscriptionsResponseMessage,
    showMySubscriptionMessage,
    subscribeError,
    subscriptionManagerResponseMessage,
    subscriptionResultMessage,
} from '../../../messages/feature/subscribeMessages';
import { CustomSubscriptions, UserRegExps } from '../../../models/constants';
import { subscribeOn } from '../../../services/domain/subscriptions';
import { catchAsyncError } from '../../../utils/catchError';
import { getSubscriptionMessageInlineKeyboard } from '../services/keyboard';
import { getUserMessageFromIKorText } from '../utils/getUserMessageFromIKorText';
import { removeCommandFromMessageIfExist } from '../../../utils/removeCommandFromMessageIfExist';
import * as TelegramBot from 'node-telegram-bot-api';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import { telegramStorage } from '../services/storage';

// TODO: Take a look in all handlers and remove unneeded parameters where they are not used
export const subscriptionManagerResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    user,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        subscriptionManagerResponseMessage(user.settings.locale),
        getSubscriptionMessageInlineKeyboard()
    );
};

export const showExistingSubscriptionsResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    user,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    const activeUserSubscription = await telegramStorage.getActiveUserSubscriptions(
        chatId
    );
    if (!activeUserSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(
            chatId,
            noSubscriptionsResponseMessage(user.settings.locale)
        );
    }

    return bot.sendMessage(
        chatId,
        showMySubscriptionMessage(activeUserSubscription)
    );
};

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export const subscribingStrategyResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
    commandParameter,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    if (!commandParameter) {
        return showExistingSubscriptionsResponse({
            bot,
            message,
            chatId,
            user,
        });
    }

    const [err, result] = await catchAsyncError<string>(
        subscribeOn(
            message.chat,
            removeCommandFromMessageIfExist(
                getUserMessageFromIKorText(
                    message,
                    CustomSubscriptions.SubscribeMeOn,
                    ''
                ),
                UserRegExps.Subscribe
            )
        )
    );
    if (err) {
        return bot.sendMessage(chatId, subscribeError(err.message));
    }

    return bot.sendMessage(chatId, subscriptionResultMessage(result));
};
