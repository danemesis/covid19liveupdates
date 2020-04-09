import {getChatId} from "./chat";
import {logger} from "../../../utils/logger";

export class MessageRegistry {
    //TODO: change type to unknown and Handle casting to BotType 
    _bot: any;
    _messageHandlers: { [regexp: string]: CallBackQueryHandler } = {};

    constructor(bot) {
        this._bot = bot;
        this.registerCallBackQuery();
    };

    public registerMessageHandler(regexp: string, callback: (bot: unknown, message: unknown, chatId: number) => unknown): MessageRegistry {
        this._messageHandlers[regexp] = callback;
        this._bot.onText(new RegExp(regexp, 'g'), (message) => callback(this._bot, message, getChatId(message)));
        return this;
    };


    private registerCallBackQuery() {
        this._bot.on("callback_query", ({id, data, message, from}) => {
            this._bot.answerCallbackQuery(id, {text: 'In process...'})
                .then(() => {
                    if (this._messageHandlers[data]) {
                        return this._messageHandlers[data].call(this, this._bot, message, from.id)
                    }

                    logger.log('error', `DIDN'T find handler for ${from.id}, ${data}, ${message}`);
                    console.log('message', message);
                });
        });
    }
}

type CallBackQueryHandler = (bot: any, message: any, chatId: unknown) => any