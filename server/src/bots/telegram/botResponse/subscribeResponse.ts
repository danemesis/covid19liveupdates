import {
    noSubscriptionsResponseMessage,
    showMySubscriptionMessage,
    subscriptionManagerResponseMessage,
    subscriptionResultMessage,
} from '../../../messages/feature/subscribeMessages';
import { subscribeOn } from '../../../services/domain/subscriptions';
import { catchAsyncError } from '../../../utils/catchError';
import { getSubscriptionMessageInlineKeyboard } from '../services/keyboard';
import * as TelegramBot from 'node-telegram-bot-api';
import {
    TelegramCallBackQueryHandlerWithCommandArgument,
    TelegramCallBackQueryParameters,
} from '../models';
import { telegramStorage } from '../services/storage';
import { getLocalizedMessages } from '../../../services/domain/localization.service';

export const subscriptionManagerResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        subscriptionManagerResponseMessage(user.settings?.locale),
        getSubscriptionMessageInlineKeyboard(user.settings?.locale)
    );
};

export const showExistingSubscriptionsResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    const activeUserSubscription = await telegramStorage().getActiveUserSubscriptions(
        chatId
    );
    if (!activeUserSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(
            chatId,
            noSubscriptionsResponseMessage(user?.settings?.locale)
        );
    }

    return bot.sendMessage(
        chatId,
        showMySubscriptionMessage(
            activeUserSubscription,
            user?.settings?.locale
        )
    );
};

export const subscribingStrategyResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
    commandParameter,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    if (!commandParameter) {
        return showExistingSubscriptionsResponse({
            bot,
            message,
            chatId,
            user,
        });
    }

    const [err, result] = await catchAsyncError<string>(
        subscribeOn(message.chat, user, commandParameter, telegramStorage())
    );
    if (err) {
        return bot.sendMessage(
            chatId,
            getLocalizedMessages(
                user?.settings?.locale,
                'Something went wrong, sorry'
            )
        );
    }

    return bot.sendMessage(
        chatId,
        subscriptionResultMessage(result, user?.settings?.locale)
    );
};
