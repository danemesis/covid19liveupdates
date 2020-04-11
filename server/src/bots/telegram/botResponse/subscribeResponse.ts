import {
    showMySubscriptionMessage,
    subscribeError,
    subscriptionResultMessage
} from "../../../messages/feature/subscribeMessage";
import {
    isCommandOnly,
    isMatchingDashboardItem,
    isMessageIsCommand,
    isMessageStartsWithCommand
} from "../../../utils/incomingMessages";
import {CustomSubscriptions, UserMessages, UserRegExps} from "../../../models/constants";
import {getUserSubscriptions, subscribeOn} from "../../../services/domain/subscribe";
import {catchAsyncError} from "../../../utils/catchError";
import {getFullMenuKeyboard} from "../services/keyboard";
import {getTelegramSubscriptions} from "../services/storage";
import {SubscriptionStorage} from "../../../models/storage.models";

export const subscribingStrategyResponse = async (bot, message, chatId): Promise<void> => {
    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || isMessageIsCommand(message.text, UserRegExps.Subscribe)
        || isMatchingDashboardItem(message.text, UserMessages.SubscriptionManager)
    ) {
        const allSubscriptions: SubscriptionStorage = await getTelegramSubscriptions();
        const userSubscription = getUserSubscriptions(chatId, allSubscriptions);
        return bot.sendMessage(
            chatId,
            showMySubscriptionMessage(userSubscription)
        )
    }

    const [err, result] = await catchAsyncError<string>(
        subscribeOn(
            message.chat,
            message.reply_markup?.inline_keyboard?.[0]?.[0].text
                .replace(`${CustomSubscriptions.SubscribeMeOn}`, '')
                .trim()
            ?? message.text
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
