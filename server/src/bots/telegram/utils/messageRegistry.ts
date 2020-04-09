import {getChatId} from "./chat";

export class MessageRegistry {
    //TODO: change type to unknown and Handle casting to BotType 
    _bot: any;
    _callBackQueryHandlers: { [id: string]: CallBackQueryHandler; } = {};

    constructor(bot) {
        this._bot = bot;
        this.registerCallBackQuery();
    };

    registerMessageHandler(regexp: string, callback: (bot: any, message: any, chatId: unknown) => any): MessageRegistry {
        this._bot.onText(new RegExp(regexp, 'g'), (message) => callback(this._bot, message, getChatId(message)));
        return this;
    };

    registerCallBackQuery() {
        this._bot.on("callback_query", (query) => {
            this._bot.answerCallbackQuery(query.id, {text: 'In process...'})
                .then(() => this._callBackQueryHandlers[query.data]?.call(this, this._bot, query.message, query.from.id));

        });
    }

    registerCallBackQueryHandler(message: string, callback: (bot: any, message: any, chatId: unknown) => any): MessageRegistry {
        this._callBackQueryHandlers[message] = callback;
        return this;
    };
}

type CallBackQueryHandler = (bot: any, message: any, chatId: unknown) => any