import {logger} from '../../../utils/logger';
import {TelegramMessage} from '../models';
import {getChatId} from '../utils/chat';
import {
    getCountryByMessage,
    getCountryNameByFlag,
    isMessageCountryFlag
} from '../../../utils/featureHelpers/isMessageCountry';
import {showCountryResponse} from '../botResponse/countryResponse';
import {catchAsyncError} from '../../../utils/catchError';
import {Country} from '../../../models/country.models';
import {adaptCountryToSystemRepresentation, getAvailableCountries} from '../../../services/domain/covid19';
import {Answer} from '../../../models/knowledgebase/answer.models';
import {fetchAnswer} from '../../../services/api/api-knowledgebase';
import {assistantResponse} from '../botResponse/assistantResponse';
import {noResponse} from '../botResponse/noResponse';

class MessageRegistry {
    // TODO: change type to unknown and Handle casting to BotType
    _bot: any;
    _cbQueryHandlers: { [regexp: string]: CallBackQueryHandler } = {};
    _messageHandlers: { [regexp: string]: CallBackQueryHandler } = {};

    public setBot(bot): void {
        this._bot = bot;
        this.registerCallBackQuery();
    }

    public registerMessageHandler(regexp: string, callback: (bot: unknown, message: TelegramMessage, chatId: number, ikCbData?: unknown) => unknown): MessageRegistry {
        this._messageHandlers[regexp] = callback;
        return this;
    };

    public registerCallBackQueryHandler(regexp: string, callback: (bot: any, message: any, chatId: unknown) => any): MessageRegistry {
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
            logger.log(
                'error',
                `[INFO] Hasn't found handler key for ${runCheckupAgainstStr}`
            );
            // TODO: Consider, maybe there is a sense to check out our Inline callback commands as well
            const [err, result] = await catchAsyncError(this.tryDeduceUserCommand(message));
            if (!!err) {
                logger.log(
                    'error',
                    `[ERROR] VERY BAD. Could not even deduce user's command for ${runCheckupAgainstStr}`
                );
            }
            return;
        }

        if (suitableKeys.length > 1) {
            logger.log(
                'info',
                `[INFO] (Might be an error) Several suitable keys for ${runCheckupAgainstStr}. \nKEYS:\n${suitableKeys.join(';\n')}`
            );
        }

        return cbHandlers[suitableKeys[0]].call(this, this._bot, message, getChatId(message), ikCbData);
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
        // throw new Error(`Could not deduce command for message - ${message.text}`);
    }
}

export const registry = new MessageRegistry();

type CallBackQueryHandler = (bot: any, message: any, chatId: unknown) => any
