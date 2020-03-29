export class MessageRegistry
{
    _bot: any;

    constructor(bot) {
        this._bot = bot;
    };

    Register(message: string, callback: (bot: any, message: any) => any) : MessageRegistry {
        this._bot.onText(new RegExp(message, 'g'), (message) => callback(this._bot, message));
        return this;
    };
    
} 