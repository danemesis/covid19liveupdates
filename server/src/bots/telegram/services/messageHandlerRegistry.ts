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
import { LogCategory } from '../../../models/constants';
import * as TelegramBot from 'node-telegram-bot-api';

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
        const systemRegExps = regexps.map((regexp: string) =>
            regexp.toLocaleLowerCase()
        );

        this._singleParameterAfterCommands = [
            ...this._singleParameterAfterCommands,
            ...systemRegExps,
        ];

        systemRegExps.forEach(
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

        const runCheckupAgainstStr = (ikCbData
            ? ikCbData
            : message.text
        ).toLocaleLowerCase();
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
            logger.log(
                'info',
                `[INFO] (Might be an error) Several suitable keys for ${runCheckupAgainstStr}. \nKEYS:\n${suitableKeys.join(
                    ';\n'
                )}`,
                LogCategory.MoreThenOneAvailableResponse,
                getChatId(message)
            );
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
            return showCountryResponse(this.bot, message, chatId, countryName);
        }

        const countries: Array<Country> = await getAvailableCountries();
        const country: Country | undefined = getCountryByMessage(
            adaptCountryToSystemRepresentation(message.text),
            countries
        );
        if (country) {
            return showCountryResponse(this.bot, message, chatId, country.name);
        }

        const answers: Array<Answer> = await fetchAnswer(message.text);
        if (answers?.length) {
            return assistantResponse(this.bot, answers, chatId);
        }

        return noResponse(this.bot, message, chatId);
    }
}

/**
 * This function is wrapper around the original User's query handler
 * It adds an additional parameter (if such exist) to original handler,
 * which will be an parameter following after command
 */
export const withSingleParameterAfterCommand = (
    context: MessageHandlerRegistry,
    handlerFn: CallBackQueryHandlerWithCommandArgument
): CallBackQueryHandlerWithCommandArgument => {
    return (
        bot: TelegramBot,
        message: TelegramBot.Message,
        chatId: number,
        ikCbData?: string
    ): Promise<TelegramBot.Message> => {
        try {
            const userEnteredArgumentAfterCommand: string = getParameterAfterCommandFromMessage.call(
                context,
                (ikCbData ?? message.text).toLocaleLowerCase()
            );

            return handlerFn.call(
                context,
                bot,
                message,
                chatId,
                userEnteredArgumentAfterCommand
            );
        } catch (err) {
            logger.error(
                `Error happend inside withSingleParameterAfterCommand() for ${chatId} with message: ${message.text} and ikCbData: ${ikCbData}`,
                err,
                LogCategory.Command,
                chatId
            );

            return noResponse(this.bot, message, chatId);
        }
    };
};

/**
 * Check out how it works here
 * https://codepen.io/belokha/pen/xxwOdWg?editors=0012
 */
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
        return undefined;
    }

    /* tslint:disable:no-string-literal */
    if (execResult.groups['command'] && !execResult.groups['firstargument']) {
        return undefined;
    }

    return execResult.groups['firstargument'];
    /* tslint:enable:no-string-literal */
}
