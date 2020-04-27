import {
    getFullMenuKeyboard,
    getUnsubscribeMessageInlineKeyboard,
} from '../services/keyboard';
import { catchAsyncError } from '../../../utils/catchError';
import { unsubscribeMeFrom } from '../../../services/domain/subscriptions';
import { noSubscriptionsResponseMessage } from '../../../messages/feature/subscribeMessages';
import * as TelegramBot from 'node-telegram-bot-api';
import {
    CallBackQueryHandlerWithCommandArgument,
    CallBackQueryParameters,
} from '../models';
import { telegramStorage } from '../services/storage';
import { getLocalizedMessage } from '../../../services/domain/localization.service';

export const buildUnsubscribeInlineResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    const userSubscription = await telegramStorage.getActiveUserSubscriptions(
        chatId
    );
    if (!userSubscription?.subscriptionsOn?.length) {
        return bot.sendMessage(
            chatId,
            noSubscriptionsResponseMessage(user.settings.locale)
        );
    }

    return bot.sendMessage(
        chatId,
        getLocalizedMessage(user.settings.locale, [
            'Choose items to unsubscribe from',
        ])[0],
        getUnsubscribeMessageInlineKeyboard(
            userSubscription.subscriptionsOn.map((v) => v.value)
        )
    );
};

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export const unsubscribeStrategyResponse: CallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    user,
    chatId,
    commandParameter,
}: CallBackQueryParameters): Promise<TelegramBot.Message> => {
    // If it's called from InlineKeyboard, then @param ikCbData will be available
    // otherwise @param ikCbData will be null
    if (!commandParameter) {
        return buildUnsubscribeInlineResponse({ bot, message, chatId, user });
    }

    const [err, result] = await catchAsyncError<string>(
        unsubscribeMeFrom(message.chat, commandParameter)
    );
    if (err) {
        return bot.sendMessage(chatId, `${err.message}, sorry 🙇🏽`);
    }

    return bot.sendMessage(
        chatId,
        getLocalizedMessage(user.settings.locale, [
            'You have been unsubscribed from',
        ])[0] + result,
        getFullMenuKeyboard(chatId, user.settings?.locale)
    );
};
