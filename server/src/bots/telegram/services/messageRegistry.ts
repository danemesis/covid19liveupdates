import {logger} from '../../../utils/logger';
import {CallBackQueryHandlerWithCommandArgument, TelegramBot, TelegramMessage} from '../models';
import {getChatId} from '../utils/chat';
import {
    getCountryByMessage,
    getCountryNameByFlag,
    isMessageCountryFlag
} from '../../../utils/featureHelpers/isMessageCountry';
import {showCountryResponse} from '../botResponse/countryResponse';
import {Country} from '../../../models/country.models';
import {adaptCountryToSystemRepresentation, getAvailableCountries} from '../../../services/domain/covid19';
import {Answer} from '../../../models/knowledgebase/answer.models';
import {fetchAnswer} from '../../../services/api/api-knowledgebase';
import {assistantResponse} from '../botResponse/assistantResponse';
import {noResponse} from '../botResponse/noResponse';
import {UserRegExps} from '../../../models/constants';
import {LogglyTypes} from '../../../models/loggly.models';

class MessageRegistry {
    // TODO: change type to unknown and Handle casting to BotType
    _bot: any;
    _cbQueryHandlers: { [regexp: string]: CallBackQueryHandlerWithCommandArgument } = {};
    _messageHandlers: { [regexp: string]: CallBackQueryHandlerWithCommandArgument } = {};

    _singleParameterCommandRegex: RegExp;

    public setBot(bot): void {
        this._bot = bot;
        this.registerCallBackQuery();
    }

    public addSingleParameterCommands(commands: Array<UserRegExps>) {
        this._singleParameterCommandRegex =
            new RegExp(`(?<command>${commands.join('|\\')})\\s(?<firstargument>.*)`);
    }

    public registerMessageHandler(regexp: string, callback: CallBackQueryHandlerWithCommandArgument): MessageRegistry {
        this._messageHandlers[regexp] = callback;
        return this;
    };

    public registerCallBackQueryHandler(regexp: string, callback: CallBackQueryHandlerWithCommandArgument): MessageRegistry {
        this._cbQueryHandlers[regexp] = callback;
        return this;
    };

    public sendUserNotification(chatId: number, notification: string): Promise<void> {
        return this._bot.sendMessage(
            chatId,
            notification
        );
    }

    public async runCommandHandler(message: TelegramMessage, ikCbData?: string): Promise<void> {
        const runCheckupAgainstStr = ikCbData ? ikCbData : message.text;
        const cbHandlers = ikCbData ? this._cbQueryHandlers : this._messageHandlers;

        const suitableKeys: Array<string> = Object.keys(cbHandlers)
            .filter((cbHandlerRegExpKey: string) =>
                !!runCheckupAgainstStr.match(new RegExp(cbHandlerRegExpKey, 'g'))
            );

        if (suitableKeys.length === 0) {
            return this.tryDeduceUserCommand(message);
        }

        if (suitableKeys.length > 1) {
            logger.log(
                'info',
                {
                    type: LogglyTypes.MoreThenOneAvailableResponse,
                    message: `[INFO] (Might be an error) Several suitable keys for ${runCheckupAgainstStr}. \nKEYS:\n${suitableKeys.join(';\n')}`
                }
            );
        }

        return cbHandlers[suitableKeys[0]]
            .call(
                this,
                this._bot,
                message,
                getChatId(message),
                ikCbData
            );
    }

    private registerCallBackQuery() {
        this._bot.on('callback_query', ({id, data, message, from}) => {
            this._bot.answerCallbackQuery(id, {text: `${data} in progress...`})
                .then(() => {

                    return this.runCommandHandler(
                        {
                            ...message,
                            from // As in cases of answerCallbackQuery original from in message will be bot sender,
                            // But we do want it still to be user. Do we? :D
                        },
                        data
                    )
                });
        });
    }

    private async tryDeduceUserCommand(message: TelegramMessage): Promise<void> {
        const chatId = getChatId(message);

        if (isMessageCountryFlag(message.text)) {
            const countryName: string = getCountryNameByFlag(message.text);
            return showCountryResponse(this._bot, countryName, chatId)
        }

        const countries: Array<Country> = await getAvailableCountries();
        const country: Country | undefined = getCountryByMessage(
            adaptCountryToSystemRepresentation(message.text),
            countries
        );
        if (country) {
            return showCountryResponse(this._bot, country.name, chatId)
        }

        const answers: Array<Answer> = await fetchAnswer(message.text);
        if (answers?.length) {
            return assistantResponse(this._bot, answers, chatId);
        }

        return noResponse(this._bot, message, chatId);
    }
}

export const registry = new MessageRegistry();

export const withCommandArgument = (handlerFn: CallBackQueryHandlerWithCommandArgument): CallBackQueryHandlerWithCommandArgument => {
    const context = registry;
    return (bot: TelegramBot, message: TelegramMessage, chatId: number, ikCbData?: string): unknown => {
        try {
            const commandArgument: string = getArgFromMessage.call(context, ikCbData ?? message.text);
            return handlerFn.call(context, bot, message, chatId, commandArgument)
        } catch (err) {
            logger.log('warn', {
                ...message,
                type: LogglyTypes.CommandError,
                message: err.message,
            });
        }
    }
}

function getArgFromMessage(messageText: string): string {
    if (!messageText) {
        throw new Error('message could not be empty');
    }

    const execResult = this._singleParameterCommandRegex.exec(messageText);
    if (!execResult) {
        throw new Error('Please input any command from available');
    }

    /* tslint:disable:no-string-literal */
    if (execResult.groups['command'] && !execResult.groups['firstargument']) {
        throw new Error(`please provide argument for \\${execResult.groups['command']}`);
    }

    return execResult.groups['firstargument'];
    /* tslint:enable:no-string-literal */
}
