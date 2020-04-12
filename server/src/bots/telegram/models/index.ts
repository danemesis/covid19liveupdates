export interface TelegramMessage {
    message_id: number;
    from: TelegramFrom;
    chat: TelegramChat;
    date: number;
    text: string;
    level: string;
    reply_markup?: unknown;
}

export interface TelegramFrom {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
}

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
