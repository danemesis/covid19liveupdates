import {getChatId} from "./chat";

export class MessageRegistry
{
    //TODO: change type to unknown and Handle casting to BotType 
    _bot: any;
    _CallBackQueryHandlers: { [id: string] : CallBackQueryHandler; } = {};

    constructor(bot) {
        this._bot = bot;
    };

    Register(message: string, callback: (bot: any, message: any, chatId: unknown) => any) : MessageRegistry {
        this._bot.onText(new RegExp(message, 'g'), (message) => callback(this._bot, message, getChatId(message)));
        return this;
    };

    RegisterCallBackQuery(){
        this._bot.on("callback_query", (query) => {
            this._bot.answerCallbackQuery(query.id, { text: 'Go'})
            .then(() => this._CallBackQueryHandlers[query.data]?.call(this, this._bot, query.message, query.from.id));
            
        });
    }

    RegisterCallBackQueryHandler(message: string, callback: (bot: any, message: any, chatId: unknown) => any) : MessageRegistry {
        this._CallBackQueryHandlers[message] = callback;
        return this;
    };
} 

type CallBackQueryHandler = (bot: any, message: any, chatId: unknown) => any