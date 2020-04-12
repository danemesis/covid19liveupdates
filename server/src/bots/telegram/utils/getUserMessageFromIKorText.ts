import {TelegramMessage, TelegramMessageReplyMarkup} from "../models";
import {isNullOrUndefined} from "../../../utils/isNullOrUndefined";

// If it's called from InlineKeyboard, then @param ikCbData will be available
// otherwise @param ikCbData will be null
export function getUserMessageFromIKorText(message: TelegramMessage): string;
export function getUserMessageFromIKorText(ikCbData: string, replace: string, replaceValue: string): string;
export function getUserMessageFromIKorText(message: TelegramMessageReplyMarkup, replace: string, replaceValue: string): string
export function getUserMessageFromIKorText<T extends TelegramMessage & TelegramMessageReplyMarkup>(message: T, replace?: string, replaceValue?: string): string {
    if (typeof message === 'string') {
        return !isNullOrUndefined(replace) && !isNullOrUndefined(replaceValue)
            ? (message as string).replace(replace, replaceValue).trim()
            : message;
    }

    return message.reply_markup?.inline_keyboard?.[0]?.[0].text
            .replace(replace, replaceValue)
            .trim()
        ?? message.text
}
