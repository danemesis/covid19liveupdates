import {
    showMySubscriptionMessage,
    subscribeCountryMessage,
    subscriptionResultMessage
} from "../../../messages/feature/subscribeMessage";
import {
    isCommandOnly,
    isMatchingDashboardItem,
    isMessageIsCommand,
    isMessageStartsWithCommand
} from "../../../utils/incomingMessages";
import {UserMessages, UserRegExps} from "../../../models/constants";
import {subscribeOn} from "../../../services/domain/subscribe";
import {catchAsyncError} from "../../../utils/catchError";

export const subscribingStrategyResponse = async (bot, message, chatId): Promise<void> => {
    console.log('INSIDE STRATEGY', message);

    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || isMessageIsCommand(message.text, UserRegExps.Subscribe)
        || isMatchingDashboardItem(message.text, UserMessages.MySubscriptions)
    ) {
        return bot.sendMessage(
            chatId,
            showMySubscriptionMessage(message)
        )
    }

    console.log('SUBSCRIPTION START');
    const [err, result] = await catchAsyncError(subscribeOn(message.chat, message.text));
    console.log('SUBSCRIPTION RESULT', err, result);

    return bot.sendMessage(
        chatId,
        subscriptionResultMessage(message)
    )
};

export const subscribeCountryResponse = (bot, message, chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        subscribeCountryMessage(message)
    )
};
