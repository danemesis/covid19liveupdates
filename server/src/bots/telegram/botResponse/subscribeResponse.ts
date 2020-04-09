import {
    showMySubscriptionMessage,
    subscribeCountryMessage,
    subscriptionResultMessage
} from "../../../messages/feature/subscribeMessage";
import {isCommandOnly, isMessageIsCommand, isMessageStartsWithCommand} from "../../../utils/incomingMessages";
import {UserRegExps} from "../../../models/constants";

export const subscribingStrategyResponse = (bot, message, chatId): Promise<void> => {
    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || isMessageIsCommand(message.text, UserRegExps.Subscribe)) {
        return _mySubscriptionResponse(bot, message, chatId)
    }

    return bot.sendMessage(
        chatId,
        subscriptionResultMessage(message)
    )
};

const _mySubscriptionResponse = (bot, message, chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        showMySubscriptionMessage(message)
    )
}

export const subscribeCountryResponse = (bot, message, chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        subscribeCountryMessage(message)
    )
};
