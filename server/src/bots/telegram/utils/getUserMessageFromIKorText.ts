import { isNullOrUndefined } from '../../../utils/isNullOrUndefined';
import * as TelegramBot from 'node-telegram-bot-api';

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export function getUserMessageFromIKorText(
    message: TelegramBot.Message
): string;
export function getUserMessageFromIKorText(
    ikCbData: string,
    replace: string,
    replaceValue: string
): string;
export function getUserMessageFromIKorText(
    message: TelegramBot.Message,
    replace: string,
    replaceValue: string
): string;
export function getUserMessageFromIKorText<T extends TelegramBot.Message>(
    message: T,
    replace?: string,
    replaceValue?: string
): string {
    if (typeof message === 'string') {
        return !isNullOrUndefined(replace) && !isNullOrUndefined(replaceValue)
            ? (message as string).replace(replace, replaceValue).trim()
            : message;
    }

    return (
        message.reply_markup?.inline_keyboard?.[0]?.[0].text
            .replace(replace, replaceValue)
            .trim() ?? message.text
    );
}
