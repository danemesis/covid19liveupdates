import { logger } from '../../../utils/logger';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import { getChatId } from '../utils/chat';
import {
    getCountryByMessage,
    getCountryNameByFlag,
    isMessageCountryFlag,
} from '../../../utils/featureHelpers/isMessageCountry';
import { showCountryResponse } from '../botResponse/countryResponse';
import { Country } from '../../../models/country.models';
import {
    adaptCountryToSystemRepresentation,
    getAvailableCountries,
} from '../../../services/domain/covid19';
import { Answer } from '../../../models/knowledgebase/answer.models';
import { fetchAnswer } from '../../../services/api/api-knowledgebase';
import { assistantResponse } from '../botResponse/assistantResponse';
import { noResponse } from '../botResponse/noResponse';
import { LogglyTypes } from '../../../models/loggly.models';
import * as TelegramBot from 'node-telegram-bot-api';
import { getInfoMessage } from '../../../utils/getErrorMessages';

export class MessageHandlerRegistry {
    _messageHandlers: {
        [regexp: string]: CallBackQueryHandlerWithCommandArgument;
    } = {};
    _singleParameterAfterCommands: Array<string> = [];

    constructor(private readonly bot: TelegramBot) {
        this.registerCallBackQuery();
    }

    public registerMessageHandler(
        regexps: Array<string>,
        callback: CallBackQueryHandlerWithCommandArgument
    ): MessageHandlerRegistry {
        this._singleParameterAfterCommands = [
            ...this._singleParameterAfterCommands,
            ...regexps,
        ];

        regexps.forEach(
            (regexp: string) =>
                (this._messageHandlers[
                    regexp
                ] = withSingleParameterAfterCommand(this, callback))
        );
        return this;
    }

    public sendUserNotification(
        chatId: number,
        notification: string
    ): Promise<TelegramBot.Message> {
        return this.bot.sendMessage(chatId, notification);
    }

    public async runCommandHandler(
        message: TelegramBot.Message,
        ikCbData?: string
    ): Promise<TelegramBot.Message> {
        logger.log('info', message);

        const runCheckupAgainstStr = ikCbData ? ikCbData : message.text;
        const cbHandlers = this._messageHandlers;

        const suitableKeys: Array<string> = Object.keys(cbHandlers).filter(
            (cbHandlerRegExpKey: string) =>
                !!runCheckupAgainstStr.match(
                    new RegExp(cbHandlerRegExpKey, 'g')
                )
        );

        if (suitableKeys.length === 0) {
            return this.tryDeduceUserCommand(message);
        }

        if (suitableKeys.length > 1) {
            logger.log('info', {
                type: LogglyTypes.MoreThenOneAvailableResponseError,
                message: `[INFO] (Might be an error) Several suitable keys for ${runCheckupAgainstStr}. \nKEYS:\n${suitableKeys.join(
                    ';\n'
                )}`,
            });
        }

        // This statement will invoke wrapper (withSingleParameterAfterCommand)
        // around original handler which is defined by default in
        // this.registerMessageHandler
        return cbHandlers[suitableKeys[0]].call(
            this,
            this.bot,
            message,
            getChatId(message),
            ikCbData
        );
    }

    private registerCallBackQuery() {
        this.bot.on('callback_query', ({ id, data, message, from }) => {
            this.bot
                .answerCallbackQuery(id, { text: `${data} in progress...` })
                .then(() => {
                    return this.runCommandHandler(
                        {
                            ...message,
                            from, // As in cases of answerCallbackQuery original from in message will be bot sender,
                            // But we do want it still to be user. Do we? :D
                        },
                        data
                    );
                });
        });
    }

    private async tryDeduceUserCommand(
        message: TelegramBot.Message
    ): Promise<TelegramBot.Message> {
        const chatId = getChatId(message);

        if (isMessageCountryFlag(message.text)) {
            const countryName: string = getCountryNameByFlag(message.text);
            return showCountryResponse(
                this.bot,
                message,
                chatId,
                countryName
            ) as Promise<TelegramBot.Message>;
        }

        const countries: Array<Country> = await getAvailableCountries();
        const country: Country | undefined = getCountryByMessage(
            adaptCountryToSystemRepresentation(message.text),
            countries
        );
        if (country) {
            return showCountryResponse(
                this.bot,
                message,
                chatId,
                country.name
            ) as Promise<TelegramBot.Message>;
        }

        const answers: Array<Answer> = await fetchAnswer(message.text);
        if (answers?.length) {
            return assistantResponse(this.bot, answers, chatId);
        }

        return noResponse(this.bot, message, chatId);
    }
}

// This function is wrapper around the original User's query handler
// It adds an additional parameter (if such exist) to original handler,
// which will be an parameter following after command
export const withSingleParameterAfterCommand = (
    context: MessageHandlerRegistry,
    handlerFn: CallBackQueryHandlerWithCommandArgument
): CallBackQueryHandlerWithCommandArgument => {
    return (
        bot: TelegramBot,
        message: TelegramBot.Message,
        chatId: number,
        ikCbData?: string
    ): unknown => {
        try {
            const userEnteredArgumentAfterCommand: string = getParameterAfterCommandFromMessage.call(
                context,
                ikCbData ?? message.text
            );

            return handlerFn.call(
                context,
                bot,
                message,
                chatId,
                userEnteredArgumentAfterCommand
            );
        } catch (err) {
            logger.log('error', {
                ...message,
                type: LogglyTypes.CommandError,
                message: err.message,
            });
        }
    };
};

// Check out how it works here
// https://codepen.io/belokha/pen/xxwOdWg?editors=0012
function getParameterAfterCommandFromMessage(
    userFullInput: string | undefined
): string | undefined {
    const makeMagicOverUserFullInput: string = this._singleParameterAfterCommands.find(
        (parameter) => parameter === userFullInput
    )
        ? userFullInput + ' ' // Problem is that userInput is the same as RegExp it returns null, but when it has
        : // at least one whitespace it is not null
          // https://codepen.io/belokha/pen/xxwOdWg?editors=0012, Example 5.
          userFullInput;

    const execResult = new RegExp(
        `(?<command>${this._singleParameterAfterCommands.join(
            '|\\'
        )})\\s(?<firstargument>.*)`
    ).exec(makeMagicOverUserFullInput);
    if (!execResult) {
        logger.log('info', getInfoMessage('Entered unsupported command'));
        return undefined;
    }

    /* tslint:disable:no-string-literal */
    if (execResult.groups['command'] && !execResult.groups['firstargument']) {
        logger.log(
            'info',
            getInfoMessage(`No parameter for ${execResult.groups['command']}`)
        );
        return undefined;
    }

    return execResult.groups['firstargument'];
    /* tslint:enable:no-string-literal */
}