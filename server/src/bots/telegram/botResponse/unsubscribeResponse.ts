import { UserSubscription } from '../../../models/subscription.models';
import {
    getUnsubscribeResponseMessage,
    unSubscribeError,
    unsubscribeResultMessage,
} from '../../../messages/feature/unsubscribeMessages';
import { getFullMenuKeyboard, getUnsubscribeMessageInlineKeyboard } from '../services/keyboard';
import {
    isCommandOnly,
    isMatchingDashboardItem,
    isMessageIsCommand,
    isMessageStartsWithCommand,
} from '../../../utils/incomingMessages';
import { CustomSubscriptions, UserMessages, UserRegExps } from '../../../models/constants';
import { catchAsyncError } from '../../../utils/catchError';
import { unsubscribeMeFrom } from '../../../services/domain/subscriptions';
import { getUserMessageFromIKorText } from '../utils/getUserMessageFromIKorText';
import { noSubscriptionsResponseMessage } from '../../../messages/feature/subscribeMessages';
import { removeCommandFromMessageIfExist } from '../../../utils/removeCommandFromMessageIfExist';
import { getTelegramActiveUserSubscriptions } from '../services/storage';
import * as TelegramBot from 'node-telegram-bot-api';

export const buildUnsubscribeInlineResponse = async (
    bot,
    message,
    chatId
): Promise<TelegramBot.Message> => {
    const userSubscription: UserSubscription = await getTelegramActiveUserSubscriptions(chatId);
    if (!userSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(chatId, noSubscriptionsResponseMessage());
    }

    return bot.sendMessage(
        chatId,
        getUnsubscribeResponseMessage(),
        getUnsubscribeMessageInlineKeyboard(userSubscription.subscriptionsOn.map((v) => v.value))
    );
};

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export const unsubscribeStrategyResponse = async (
    bot,
    message,
    chatId,
    ikCbData?: string
): Promise<TelegramBot.Message> => {
    // If it's called from InlineKeyboard, then @param ikCbData will be available
    // otherwise @param ikCbData will be null
    if (ikCbData && isMatchingDashboardItem(ikCbData, UserMessages.Unsubscribe)) {
        return buildUnsubscribeInlineResponse(bot, message, chatId);
    }

    if (
        (isMessageStartsWithCommand(message.text) && isCommandOnly(message.text)) ||
        isMessageIsCommand(message.text, UserRegExps.Unsubscribe) ||
        isMatchingDashboardItem(message.text, UserMessages.Unsubscribe)
    ) {
        return buildUnsubscribeInlineResponse(bot, message, chatId);
    }

    const [err, result] = await catchAsyncError<string>(
        unsubscribeMeFrom(
            message.chat,
            removeCommandFromMessageIfExist(
                getUserMessageFromIKorText(
                    ikCbData ?? message,
                    CustomSubscriptions.UnsubscribeMeFrom,
                    ''
                ),
                UserRegExps.Unsubscribe
            )
        )
    );

    if (err) {
        return bot.sendMessage(chatId, unSubscribeError(err.message));
    }

    return bot.sendMessage(chatId, unsubscribeResultMessage(result), getFullMenuKeyboard(chatId));
};
