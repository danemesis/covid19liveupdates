import {
    fetchAnswer,
    fetchKnowledgeMetainformation,
} from '../../../services/api/api-knowledgebase';
import { Answer } from '../../../models/knowledgebase/answer.models';
import {
    getAnswersOnQuestionMessage,
    getAssistantFeaturesMessage,
    getAssistantIsOnLunchMessage,
    noAnswersOnQuestionMessage,
} from '../../../messages/feature/assistantMessages';
import {
    TelegramCallBackQueryHandlerWithCommandArgument,
    TelegramCallBackQueryParameters,
} from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import { LogCategory } from '../../../models/constants';
import { User } from '../../../models/user.model';

export const showAssistantFeatures: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    const [err, knowledgebaseMeta] = await catchAsyncError(
        fetchKnowledgeMetainformation()
    );
    if (err) {
        // TODO: change severity level to be critical
        logger.error(
            'Error occured when trying to acces fetchKnowledgeMetainformation',
            err,
            LogCategory.Assistant
        );
    }
    const messageText =
        err === undefined
            ? getAssistantFeaturesMessage(
                  user.settings?.locale,
                  knowledgebaseMeta
              )
            : getAssistantIsOnLunchMessage(user.settings?.locale);

    return bot.sendMessage(chatId, messageText);
};

export const assistantNoAnswerResponse = async ({
    bot,
    chatId,
    user,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    return bot.sendMessage(
        chatId,
        noAnswersOnQuestionMessage(user.settings?.locale)
    );
};

export const assistantResponse = async (
    bot: TelegramBot,
    answers: Array<Answer>,
    chatId: number,
    user: User
) => {
    return bot.sendMessage(
        chatId,
        getAnswersOnQuestionMessage(user.settings?.locale, answers)
    );
};

export const assistantStrategyResponse: TelegramCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
    commandParameter,
}: TelegramCallBackQueryParameters): Promise<TelegramBot.Message> => {
    if (!commandParameter) {
        return showAssistantFeatures({ bot, message, chatId, user });
    }

    const answers: Array<Answer> = await fetchAnswer(commandParameter);
    if (!answers.length) {
        return assistantNoAnswerResponse({ bot, message, chatId, user });
    }

    return assistantResponse(bot, answers, chatId, user);
};
