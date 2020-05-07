import { MessageRegistry } from '../../../services/domain/registry/messageRegistry';
import { ViberBot, ViberTextMessage } from '../models';
import { getViberChatId } from '../utils/getViberChatId';
import { DEFAULT_USER_SETTINGS, User } from '../../../models/user.model';
import * as TelegramBot from 'node-telegram-bot-api';
import { UserService } from '../../../services/domain/user.service';
import { logger } from '../../../utils/logger';
import { LogCategory } from '../../../models/constants';
import { Message } from 'viber-bot';

export class ViberMessageRegistry extends MessageRegistry {
    public getChatId: (params: ViberTextMessage) => string = getViberChatId;

    constructor(
        protected readonly bot: ViberBot,
        protected readonly userService: UserService
    ) {
        super(bot, userService);
    }

    protected async tryDeduceUserCommand(
        message: ViberTextMessage,
        chatId: number,
        user: User
    ): Promise<ViberTextMessage> {
        /// TODO: Implement
        logger.error(
            'Viber try to deduce command',
            new Error('Viber try to deduce command'),
            LogCategory.ViberTryingDeduceCommand,
            chatId
        );
        return Promise.resolve({} as any);
    }

    public sendUserNotification(
        chatId: number,
        notification: string
    ): Promise<TelegramBot.Message> {
        return this.bot.sendMessage(
            { id: chatId.toString() },
            new Message.Text(notification)
        );
    }

    protected createUser(message: ViberTextMessage, chatId: number): User {
        return {
            ...DEFAULT_USER_SETTINGS,
            chatId,
            userName: message.chat?.name || '',
            firstName: message.chat?.name.split(' ')[1] || '',
            lastName: message.chat?.name.split(' ')[0] || '',
            startedOn: Date.now(),
        };
    }
}
