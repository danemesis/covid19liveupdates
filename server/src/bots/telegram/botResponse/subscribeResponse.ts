import {
    noSubscriptionsResponseMessage,
    showMySubscriptionMessage,
    subscribeError,
    subscriptionManagerResponseMessage,
    subscriptionResultMessage
} from "../../../messages/feature/subscribeMessages";
import {
    isCommandOnly,
    isMatchingDashboardItem,
    isMessageIsCommand,
    isMessageStartsWithCommand
} from "../../../utils/incomingMessages";
import {CustomSubscriptions, UserMessages, UserRegExps} from "../../../models/constants";
import {getConcreteUserSubscriptions, subscribeOn} from "../../../services/domain/subscriptions";
import {catchAsyncError} from "../../../utils/catchError";
import {getFullMenuKeyboard, getSubscriptionMessageInlineKeyboard} from "../services/keyboard";
import {getTelegramSubscriptions} from "../services/storage";
import {SubscriptionStorage} from "../../../models/storage.models";
import {getUserMessageFromIKorText} from "../utils/getUserMessageFromIKorText";
import {Subscription, UserSubscription} from "../../../models/subscription.models";

export const subscriptionManagerResponse = async (bot, message, chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        subscriptionManagerResponseMessage(),
        getSubscriptionMessageInlineKeyboard(),
    )
};

export const showExistingSubscriptionsResponse = async (bot, message, chatId): Promise<void> => {
    const allSubscriptions: SubscriptionStorage = await getTelegramSubscriptions();
    const userSubscription: UserSubscription = getConcreteUserSubscriptions(chatId, allSubscriptions);
    const activeUserSubscription: UserSubscription = {
        ...userSubscription,
        subscriptionsOn: userSubscription.subscriptionsOn.filter((subscription: Subscription) => subscription.active !== false)
    };

    if (!activeUserSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(
            chatId,
            noSubscriptionsResponseMessage()
        )
    }

    return bot.sendMessage(
        chatId,
        showMySubscriptionMessage(activeUserSubscription)
    );
};

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export const subscribingStrategyResponse = async (bot, message, chatId, ikCbData?: string): Promise<void> => {
    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || isMessageIsCommand(message.text, UserRegExps.Subscribe)
        || isMatchingDashboardItem(message.text, UserMessages.SubscriptionManager)
    ) {
        return showExistingSubscriptionsResponse(bot, message, chatId);
    }

    const [err, result] = await catchAsyncError<string>(
        subscribeOn(
            message.chat,
            getUserMessageFromIKorText(message, CustomSubscriptions.SubscribeMeOn, '')
        )
    );
    if (err) {
        return bot.sendMessage(
            chatId,
            subscribeError(err.message)
        )
    }

    return bot.sendMessage(
        chatId,
        subscriptionResultMessage(result),
        getFullMenuKeyboard(chatId)
    )
};
