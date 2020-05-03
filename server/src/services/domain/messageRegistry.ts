import { CallBackQueryHandlerWithCommandArgument } from '../../bots/telegram/models';
import { logger } from '../../utils/logger';
import { getChatId } from '../../bots/telegram/utils/chat';
import { User } from '../../models/user.model';
import { telegramUserService } from '../../bots/telegram/services/user';
import { LogCategory } from '../../models/constants';
import {
    getCountryByMessage,
    getCountryNameByFlag,
    isMessageCountryFlag,
} from '../../utils/featureHelpers/isMessageCountry';
import { showCountryResponse } from '../../bots/telegram/botResponse/countryResponse';
import { Country } from '../../models/country.models';
import { getAvailableCountries } from './covid19';
import { getCountryNameFormat } from './countries';
import { Answer } from '../../models/knowledgebase/answer.models';
import { fetchAnswer } from '../api/api-knowledgebase';
import { assistantResponse } from '../../bots/telegram/botResponse/assistantResponse';
import { noResponse } from '../../bots/telegram/botResponse/noResponse';
import { Bot, Message } from '../../models/bots';

export abstract class MessageRegistry {
    private messageHandlers: {
        [regexp: string]: CallBackQueryHandlerWithCommandArgument;
    } = {};
    public singleParameterAfterCommands: Array<string> = [];

    constructor(private readonly bot: Bot) {
        this.registerCallBackQuery();
    }

    public registerMessageHandler(
        regexps: Array<string>,
        callback: CallBackQueryHandlerWithCommandArgument
    ): MessageRegistry {
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

    public abstract sendUserNotification(
        chatId: number,
        notification: string
    ): Promise<Message>;

    public async runCommandHandler(
        message: Message,
        ikCbData?: string
    ): Promise<Message> {
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
        message: Message,
        chatId: number,
        user: User
    ): Promise<Message> {
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
            return assistantResponse(this.bot, answers, chatId, user);
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

    public abstract async createAndAddUser(
        message: Message,
        chatId: number
    ): Promise<User>;
}
