export interface TelegramChat {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    type: string | 'private';
}

export interface TelegramMessage {
    text: string
}

export interface TelegramMessageReplyMarkup {
    reply_markup: {
        inline_keyboard: Array<Array<{ text: string }>>
    }
}

export const TELEGRAM_PREFIX: string = 'telegram';
export const UNSUBSCRIPTIONS_ROW_ITEMS_NUMBER: number = 3;
