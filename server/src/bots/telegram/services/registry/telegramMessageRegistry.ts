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
import * as TelegramBot from 'node-telegram-bot-api';
import { getCountryNameFormat } from '../../../../services/domain/countries';
import { telegramUserService } from '../user';
import { DEFAULT_USER_SETTINGS, User } from '../../../../models/user.model';
import { MessageRegistry } from '../../../../services/domain/registry/messageRegistry';
import { Message } from '../../../../models/bots';
import { getTelegramChatId } from '../../utils/chat';

export class TelegramMessageRegistry extends MessageRegistry {
    public getChatId: (params: Message) => number = getTelegramChatId;

    constructor(protected readonly bot: TelegramBot) {
        super(bot);
        this.registerCallBackQuery();
    }

    protected async tryDeduceUserCommand(
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
            return assistantResponse(this.bot, answers, chatId, user);
        }

        return noResponse({
            bot: this.bot,
            message,
            chatId,
            user,
        });
    }

    public sendUserNotification(
        chatId: number,
        notification: string
    ): Promise<TelegramBot.Message> {
        return this.bot.sendMessage(chatId, notification);
    }

    protected async createAndAddUser(
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

    protected async getUser(chatId: number): Promise<User> {
        return telegramUserService.getUser(chatId);
    }

    protected async setUserInterruptedCommand(user: User): Promise<void> {
        return telegramUserService.setUserInterruptedCommand(user, null);
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
}
