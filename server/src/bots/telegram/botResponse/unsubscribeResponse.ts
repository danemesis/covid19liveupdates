import {
    getFullMenuKeyboard,
    getUnsubscribeMessageInlineKeyboard,
} from '../services/keyboard';
import { catchAsyncError } from '../../../utils/catchError';
import { unsubscribeMeFrom } from '../../../services/domain/subscriptions';
import { noSubscriptionsResponseMessage } from '../../../messages/feature/subscribeMessages';
import * as TelegramBot from 'node-telegram-bot-api';
import {
    TelegramCallBackQueryHandlerWithCommandArgument,
    TelegramCallBackQueryParameters,
} from '../models';
import { telegramStorage } from '../services/storage';
import { getLocalizedMessages } from '../../../services/domain/localization.service';

export const buildUnsubscribeInlineResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    const userSubscription = await telegramStorage().getActiveUserSubscriptions(
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
        getLocalizedMessages(
            user.settings.locale,
            'Choose items to unsubscribe from'
        ),
        getUnsubscribeMessageInlineKeyboard(
            userSubscription.subscriptionsOn.map((v) => v.value)
        )
    );
};

export const unsubscribeStrategyResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    user,
    chatId,
    commandParameter,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    if (!commandParameter) {
        return buildUnsubscribeInlineResponse({ bot, message, chatId, user });
    }

    const [err, result] = await catchAsyncError<string>(
        unsubscribeMeFrom(message.chat, commandParameter, telegramStorage())
    );
    if (err) {
        return bot.sendMessage(chatId, `${err.message}, sorry 🙇🏽`);
    }

    return bot.sendMessage(
        chatId,
        getLocalizedMessages(
            user.settings.locale,
            'You have been unsubscribed from'
        ) + result,
        getFullMenuKeyboard(chatId, user.settings?.locale)
    );
};
