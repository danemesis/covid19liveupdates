import {getChatId} from '../utils/chat';
import {logger} from '../../../utils/logger';
import {UserRegExps} from '../../../models/constants';

class MessageRegistry {
    // TODO: change type to unknown and Handle casting to BotType
    _bot: any;
    _cbQueryHandlers: { [regexp: string]: CallBackQueryHandler } = {};
    _messageHandlers: { [regexp: string]: CallBackQueryHandler } = {};

    _singleParameterCommandRegex: RegExp;

    public setBot(bot): void {
        this._bot = bot;
        this.registerCallBackQuery();
    }

    public addSingelParameterCommands(commands: Array<UserRegExps>){
        this._singleParameterCommandRegex = 
            new RegExp(`(?<command>${commands.join('|\\')})\\s(?<firstargument>.*)`);
    }

    public registerMessageHandler(regexp: string, callback: CallBackQueryHandler): MessageRegistry {
        this._messageHandlers[regexp] = callback;
        this._bot.onText(new RegExp(regexp, 'g'), (message) => callback(this._bot, message, getChatId(message)));
        return this;
    };

    public registerCallBackQueryHandler(message: string, callback: CallBackQueryHandler): MessageRegistry {
        this._cbQueryHandlers[message] = callback;
        return this;
    };

    public sendUserNotification(chatId: number, notification: string): Promise<void> {
        return this._bot.sendMessage(
            chatId,
            notification
        );
    }

    private registerCallBackQuery() {
        this._bot.on('callback_query', ({id, data, message, from}) => {
            this._bot.answerCallbackQuery(id, {text: 'In process...'})
                .then(() => {
                    if (this._messageHandlers[data]) {
                        return this._messageHandlers[data].call(this, this._bot, message, from.id, data)
                    }

                    if (this._cbQueryHandlers[data]) {
                        return this._cbQueryHandlers[data].call(this, this._bot, message, from.id, data)
                    }

                    const partialMatchCbHandlerKey = Object.keys(this._cbQueryHandlers)
                        .find((key: string) => (data as string).includes(key));
                    if (partialMatchCbHandlerKey) {
                        return this._cbQueryHandlers[partialMatchCbHandlerKey].call(this, this._bot, message, from.id, data);
                    }

                    logger.log('error', `DIDN'T find handler for ${from.id}, ${data}, ${message}`);
                });
        });
    }
}

export const registry = new MessageRegistry();

type CallBackQueryHandler = (bot: any, message: any, chatId: unknown, argument?: any) => any

export function WithCommandArgument(handler: CallBackQueryHandler): any {
    const context = registry;
    return (bot: any, message: any, chatId: unknown, data?: string): any => {
        try{
            const argument = getArgfromMessage.call(context, data || message.text);
            handler.call(context, bot, message, chatId, argument)
        }
        catch(Error){
            logger.log('warn', {
                ...message,
                warningMessage: Error.message,
            });
            bot.sendMessage(chatId, Error.message);
        }
    }
}
function getArgfromMessage(messageText: string): string{
    if(!messageText){
        throw new Error('message could not be empty');
    }
    const execResult = this._singleParameterCommandRegex.exec(messageText);
    if(!execResult){
        return 'Plese input any command from avalable';
    }
    /* tslint:disable:no-string-literal */
    if(execResult.groups['command'] && !execResult.groups['firstargument']){
        return `please provide argument for \\${execResult.groups['command']}`;
    }
    return execResult.groups['firstargument'];
    /* tslint:enable:no-string-literal */
}