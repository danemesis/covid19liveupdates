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
import { telegramUserService } from '../user';
import { DEFAULT_USER_SETTINGS, User } from '../../../../models/user.model';

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
            (regexp: string) => (this.messageHandlers[regexp] = callback)
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
        const chatId: number = getChatId(message);
        const user: User | null =
            (await telegramUserService.getUser(chatId)) ??
            (await this.createAndAddUser(message, chatId));

        const runCheckupAgainstStr = (ikCbData
            ? ikCbData
            : message.text
        ).toLocaleLowerCase();
        const cbHandlers = this.messageHandlers;

        const suitableKeys: Array<string> = this.getSuitableCbHandlersKey(
            cbHandlers,
            runCheckupAgainstStr
        );

        if (suitableKeys.length === 0) {
            return this.tryDeduceUserCommand(message, chatId, user);
        }

        if (suitableKeys.length > 1) {
            logger.log(
                'info',
                `[INFO] (Might be an error) Several suitable keys for ${runCheckupAgainstStr}. \nKEYS:\n${suitableKeys.join(
                    ';\n'
                )}`,
                LogCategory.MoreThenOneAvailableResponse,
                chatId
            );
        }

        // This statement will invoke wrapper/wrappers
        // (withSingleParameterAfterCommand and/or withTwoArgumentsAfterCommand)
        // around original handler which is defined in telegram/index.ts file
        return cbHandlers[suitableKeys[0]]
            .call(this, {
                bot: this.bot,
                message,
                chatId,
                user,
                messageHandlerRegistry: this,
                commandParameter: ikCbData,
            })
            .then(async () => {
                /**
                 * This logic is for cases when we have some command from
                 * a user, although we didn't invoke it for any reason
                 * @example A user enters /start for the first time (this will **{{1}}**
                 * be executed in cbHandlers[suitableKeys[0]].call (line)
                 * thus he doesn't have setup anything yet. We want to offer
                 * him make language first, therefore we invoke
                 * /UserSettingsRegExps.Language (/language) script
                 * which will offer to choose language for user. However,
                 * after he makes such his decision we still want to execute  **{{1}}**
                 */
                const userBeforeExecutionCbHandler: User = user;
                /**
                 * We're checking userBeforeExecutionCbHandler because
                 * interruptedCommand should have been set up in the **{{1}}**
                 * However, on this cycle we do not want to show user info,
                 * because we just interrupted his command by our's. After he
                 * proceeds with our, it will be next cycle and we should then
                 * check.
                 */
                if (userBeforeExecutionCbHandler.state?.interruptedCommand) {
                    const upToDateUser: User = await telegramUserService.getUser(
                        user
                    );
                    /**
                     * Always update up-to-date user
                     */
                    await telegramUserService.setUserInterruptedCommand(
                        upToDateUser,
                        null
                    );
                    return this.runCommandHandler({
                        ...message,
                        text: upToDateUser.state.interruptedCommand,
                    });
                }
            });
    }

    private async tryDeduceUserCommand(
        message: TelegramBot.Message,
        chatId: number,
        user: User
    ): Promise<TelegramBot.Message> {
        if (isMessageCountryFlag(message.text)) {
            const countryName: string = getCountryNameByFlag(message.text);
            return showCountryResponse({
                bot: this.bot,
                message,
                chatId,
                user,
                commandParameter: countryName,
            });
        }

        const countries: Array<Country> = await getAvailableCountries();
        const country: Country | undefined = getCountryByMessage(
            getCountryNameFormat(message.text),
            countries
        );
        if (country) {
            return showCountryResponse({
                bot: this.bot,
                message,
                chatId,
                commandParameter: country.name,
                user,
            });
        }

        const answers: Array<Answer> = await fetchAnswer(message.text);
        if (answers?.length) {
            return assistantResponse(this.bot, answers, chatId);
        }

        return noResponse({
            bot: this.bot,
            message,
            chatId,
            user,
        });
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

    private getSuitableCbHandlersKey(
        cbHandlers: {
            [regexp: string]: CallBackQueryHandlerWithCommandArgument;
        },
        runCheckupAgainstStr: string
    ): Array<string> {
        return Object.keys(cbHandlers).filter(
            (cbHandlerRegExpKey: string) =>
                !!runCheckupAgainstStr.match(
                    new RegExp(cbHandlerRegExpKey, 'g')
                )
        );
    }

    private async createAndAddUser(
        message: TelegramBot.Message,
        chatId: number
    ): Promise<User> {
        return telegramUserService.addUser({
            ...DEFAULT_USER_SETTINGS,
            chatId,
            userName: message.chat?.username || '',
            firstName: message.chat?.first_name || '',
            lastName: message.chat?.last_name || '',
            startedOn: Date.now(),
        });
    }
}
