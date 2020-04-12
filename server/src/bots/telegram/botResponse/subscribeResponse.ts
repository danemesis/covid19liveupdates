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
import {subscribeOn} from "../../../services/domain/subscriptions";
import {catchAsyncError} from "../../../utils/catchError";
import {getFullMenuKeyboard, getSubscriptionMessageInlineKeyboard} from "../services/keyboard";
import {getTelegramActiveUserSubscriptions} from "../services/storage";
import {getUserMessageFromIKorText} from "../utils/getUserMessageFromIKorText";
import {UserSubscription} from "../../../models/subscription.models";
import {removeCommandFromMessageIfExist} from "../../../utils/removeCommandFromMessageIfExist";

// TODO: Take a look in all handlers and remove unneeded parameters where they are not used
export const subscriptionManagerResponse = async (bot, message, chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        subscriptionManagerResponseMessage(),
        getSubscriptionMessageInlineKeyboard(),
    )
};

export const showExistingSubscriptionsResponse = async (bot, message, chatId): Promise<void> => {
    const activeUserSubscription: UserSubscription = await getTelegramActiveUserSubscriptions(chatId);
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
            removeCommandFromMessageIfExist(
                getUserMessageFromIKorText(message, CustomSubscriptions.SubscribeMeOn, ''),
                UserRegExps.Subscribe
            )
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
