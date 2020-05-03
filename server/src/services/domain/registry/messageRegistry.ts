import { logger } from '../../../utils/logger';
import { User } from '../../../models/user.model';
import { LogCategory } from '../../../models/constants';
import {
    Bot,
    CallBackQueryHandlerWithCommandArgument,
    Message,
} from '../../../models/bots';

export abstract class MessageRegistry {
    private messageHandlers: {
        [regexp: string]: CallBackQueryHandlerWithCommandArgument;
    } = {};
    public singleParameterAfterCommands: Array<string> = [];

    public abstract getChatId: (params: Message) => number;

    protected constructor(protected readonly bot: Bot) {}

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

    public async runCommandHandler(
        message: Message,
        ikCbData?: string
    ): Promise<Message> {
        logger.log('info', message);
        const chatId: number = this.getChatId(message);
        const user: User | null =
            (await this.getUser(chatId)) ??
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
                    const upToDateUser: User = await this.getUser(user.chatId);
                    /**
                     * Always update up-to-date user
                     */
                    await this.setUserInterruptedCommand(upToDateUser);
                    return this.runCommandHandler({
                        ...message,
                        text: upToDateUser.state.interruptedCommand,
                    });
                }
            });
    }

    public abstract sendUserNotification(
        chatId: number,
        notification: string
    ): Promise<Message>;

    protected abstract async tryDeduceUserCommand(
        message: Message,
        chatId: number,
        user: User
    ): Promise<Message>;

    protected abstract async createAndAddUser(
        message: Message,
        chatId: number
    ): Promise<User>;

    protected abstract async getUser(chatId: number): Promise<User>;

    protected abstract async setUserInterruptedCommand(
        user: User
    ): Promise<void>;

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
}
