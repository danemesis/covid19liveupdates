import { UserSubscription } from '../../../models/subscription.models';
import {
    getUnsubscribeResponseMessage,
    unSubscribeErrorMessage,
    unsubscribeResultMessage,
} from '../../../messages/feature/unsubscribeMessages';
import {
    getFullMenuKeyboard,
    getUnsubscribeMessageInlineKeyboard,
} from '../services/keyboard';
import { catchAsyncError } from '../../../utils/catchError';
import { unsubscribeMeFrom } from '../../../services/domain/subscriptions';
import { noSubscriptionsResponseMessage } from '../../../messages/feature/subscribeMessages';
import { getTelegramActiveUserSubscriptions } from '../services/storage';
import * as TelegramBot from 'node-telegram-bot-api';
import { CallBackQueryHandlerWithCommandArgument } from '../models';

export const buildUnsubscribeInlineResponse = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    const userSubscription: UserSubscription = await getTelegramActiveUserSubscriptions(
        chatId
    );
    if (!userSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(chatId, noSubscriptionsResponseMessage());
    }

    return bot.sendMessage(
        chatId,
        getUnsubscribeResponseMessage(),
        getUnsubscribeMessageInlineKeyboard(
            userSubscription.subscriptionsOn.map((v) => v.value)
        )
    );
};

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export const unsubscribeStrategyResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    commandParameter?: string
): Promise<TelegramBot.Message> => {
    // If it's called from InlineKeyboard, then @param ikCbData will be available
    // otherwise @param ikCbData will be null
    if (!commandParameter) {
        return buildUnsubscribeInlineResponse(bot, message, chatId);
    }

    const [err, result] = await catchAsyncError<string>(
        unsubscribeMeFrom(message.chat, commandParameter)
    );
    if (err) {
        return bot.sendMessage(chatId, unSubscribeErrorMessage(err.message));
    }

    return bot.sendMessage(
        chatId,
        unsubscribeResultMessage(result),
        getFullMenuKeyboard(chatId)
    );
};
