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
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import { telegramStorage } from '../services/storage';

// TODO: Take a look in all handlers and remove unneeded parameters where they are not used
export const subscriptionManagerResponse = async (
    bot,
    message,
    chatId
): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        subscriptionManagerResponseMessage(),
        getSubscriptionMessageInlineKeyboard()
    );
};

export const showExistingSubscriptionsResponse = async (
    bot,
    message,
    chatId
): Promise<TelegramBot.Message> => {
    const activeUserSubscription = await telegramStorage.getActiveUserSubscriptions(
        chatId
    );
    if (!activeUserSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(chatId, noSubscriptionsResponseMessage());
    }

    return bot.sendMessage(
        chatId,
        showMySubscriptionMessage(activeUserSubscription)
    );
};

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export const subscribingStrategyResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    commandParameter?: string
): Promise<TelegramBot.Message> => {
    if (!commandParameter) {
        return showExistingSubscriptionsResponse(bot, message, chatId);
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
