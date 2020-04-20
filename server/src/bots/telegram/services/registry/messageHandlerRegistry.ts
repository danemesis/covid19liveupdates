import { logger } from '../../../../utils/logger';
import { CallBackQueryHandlerWithCommandArgument } from '../../models';
import { getChatId } from '../../utils/chat';
import {
    getCountryByMessage,
    getCountryNameByFlag,
    isMessageCountryFlag,
} from '../../../../utils/featureHelpers/isMessageCountry';
import { showCountryResponse } from '../../botResponse/countryResponse';
import { Country } from '../../../../models/country.models';
import { getAvailableCountries } from '../../../../services/domain/covid19';
import { Answer } from '../../../../models/knowledgebase/answer.models';
import { fetchAnswer } from '../../../../services/api/api-knowledgebase';
import { assistantResponse } from '../../botResponse/assistantResponse';
import { noResponse } from '../../botResponse/noResponse';
import { LogCategory } from '../../../../models/constants';
import * as TelegramBot from 'node-telegram-bot-api';
import { getCountryNameFormat } from '../../../../services/domain/countries';
import { withSingleParameterAfterCommand } from './withSingleParameterAfterCommand';

export class MessageHandlerRegistry {
    private messageHandlers: {
        [regexp: string]: CallBackQueryHandlerWithCommandArgument;
    } = {};
    public singleParameterAfterCommands: Array<string> = [];

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

        this.singleParameterAfterCommands = [
            ...this.singleParameterAfterCommands,
            ...systemRegExps,
        ];

        systemRegExps.forEach(
            (regexp: string) =>
                (this.messageHandlers[regexp] = withSingleParameterAfterCommand(
                    this,
                    callback
                ))
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
        const cbHandlers = this.messageHandlers;

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
            getCountryNameFormat(message.text),
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

export const withTwoArgumentsAfterCommand = (
    handlerFn: CallBackQueryHandlerWithCommandArgument
): CallBackQueryHandlerWithCommandArgument => {
    return (
        bot: TelegramBot,
        message: TelegramBot.Message,
        chatId: number,
        ikCbData?: string
    ): Promise<TelegramBot.Message> => {
        try {
            const [arg1, arg2] = splitArgument(ikCbData);

            return handlerFn.call(
                this,
                bot,
                message,
                chatId,
                (arg1 && arg1.toLowerCase()) || ikCbData,
                arg2 && arg2.toLowerCase()
            );
        } catch (err) {
            logger.error(
                `Error happend inside withTwoArgumentsAfterCommand() for ${chatId} with message: ${message.text} and ikCbData: ${ikCbData}`,
                err,
                LogCategory.Command,
                chatId
            );

            return noResponse(this.bot, message, chatId);
        }
    };
};

const splitArgsRegexp = new RegExp(
    '(?<firstArg>[^ ]+)[\\s.,;]+(?<secondArg>[^ ]+)'
);
function splitArgument(argument: string): [string, string] {
    const match = splitArgsRegexp.exec(argument);
    if (!match) {
        return [undefined, undefined];
    }

    /* tslint:disable:no-string-literal */
    return [match.groups['firstArg'], match.groups['secondArg']];
}
