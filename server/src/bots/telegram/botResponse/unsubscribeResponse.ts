import {getUserSubscriptions} from "../services/subscriptionNotifierManager";
import {Subscription, UserSubscription} from "../../../models/subscription.models";
import {
    getUnsubscribeResponseMessage,
    unSubscribeError,
    unsubscribeResultMessage
} from "../../../messages/feature/unsubscribeMessages";
import {getFullMenuKeyboard, getUnsubscribeMessageInlineKeyboard} from "../services/keyboard";
import {
    isCommandOnly,
    isMatchingDashboardItem,
    isMessageIsCommand,
    isMessageStartsWithCommand
} from "../../../utils/incomingMessages";
import {CustomSubscriptions, UserMessages, UserRegExps} from "../../../models/constants";
import {catchAsyncError} from "../../../utils/catchError";
import {unsubscribeMeFrom} from "../../../services/domain/subscriptions";
import {getUserMessageFromIKorText} from "../utils/getUserMessageFromIKorText";
import {noSubscriptionsResponseMessage} from "../../../messages/feature/subscribeMessages";

export const buildUnsubscribeInlineResponse = async (bot, message, chatId): Promise<void> => {
    const userSubscription: UserSubscription = await getUserSubscriptions(chatId);
    if (!userSubscription?.subscriptionsOn?.filter((subscription: Subscription) => subscription.active !== false).length) {
        return bot.sendMessage(
            chatId,
            noSubscriptionsResponseMessage()
        )
    }

    return bot.sendMessage(
        chatId,
        getUnsubscribeResponseMessage(),
        getUnsubscribeMessageInlineKeyboard(
            userSubscription
                .subscriptionsOn
                .filter(v => v.active !== false)
                .map(v => v.value)
        )
    )
};

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export const unsubscribeStrategyResponse = async (bot, message, chatId, ikCbData?: string): Promise<void> => {
    // If it's called from InlineKeyboard, then @param ikCbData will be available
    // otherwise @param ikCbData will be null
    if (ikCbData
        && isMatchingDashboardItem(ikCbData, UserMessages.Unsubscribe)) {
        return buildUnsubscribeInlineResponse(bot, message, chatId);
    }

    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || isMessageIsCommand(message.text, UserRegExps.Unsubscribe)
        || isMatchingDashboardItem(message.text, UserMessages.Unsubscribe)
    ) {
        return buildUnsubscribeInlineResponse(bot, message, chatId);
    }

    const [err, result] = await catchAsyncError<string>(
        unsubscribeMeFrom(
            message.chat,
            getUserMessageFromIKorText(
                ikCbData ?? message,
                CustomSubscriptions.UnsubscribeMeFrom, ''
            )
        )
    );

    if (err) {
        return bot.sendMessage(
            chatId,
            unSubscribeError(err.message)
        )
    }

    return bot.sendMessage(
        chatId,
        unsubscribeResultMessage(result),
        getFullMenuKeyboard(chatId)
    )
};
