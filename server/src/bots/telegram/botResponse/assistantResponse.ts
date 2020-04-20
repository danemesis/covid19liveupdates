import {
    fetchAnswer,
    fetchKnowledgeMetainformation,
} from '../../../services/api/api-knowledgebase';
import { Answer } from '../../../models/knowledgebase/answer.models';
import {
    getAnswersOnQuestionMessage,
    getAssistantFeaturesMessage,
    noAnswersOnQuestionMessage,
    getAssistantIsOnLunchMessage,
} from '../../../messages/feature/assistantMessages';
import { KnowledgebaseMeta } from '../../../models/knowledgebase/meta.models';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import { LogglyTypes } from '../../../models/loggly.models';

export const showAssistantFeatures: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    const [err, knowledgebaseMeta] = await catchAsyncError(
        fetchKnowledgeMetainformation()
    );
    if (err) {
        // TODO: change severity level to be critical
        logger.error(
            'Error occured when trying to acces fetchKnowledgeMetainformation',
            err,
            LogglyTypes.Assistant
        );
    }
    const messageText =
        err === undefined
            ? getAssistantFeaturesMessage(knowledgebaseMeta)
            : getAssistantIsOnLunchMessage();

    return bot.sendMessage(chatId, messageText);
};

export const assistantNoAnswerResponse = async (
    bot: TelegramBot,
    chatId: number
): Promise<TelegramBot.Message> => {
    return bot.sendMessage(chatId, noAnswersOnQuestionMessage());
};

export const assistantResponse = async (
    bot: TelegramBot,
    answers: Array<Answer>,
    chatId: number
) => {
    return bot.sendMessage(chatId, getAnswersOnQuestionMessage(answers));
};

export const assistantStrategyResponse: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number,
    commandParameter?: string
): Promise<TelegramBot.Message> => {
    if (!commandParameter) {
        return showAssistantFeatures(bot, message, chatId);
    }

    const answers: Array<Answer> = await fetchAnswer(commandParameter);
    if (!answers.length) {
        return assistantNoAnswerResponse(bot, chatId);
    }

    return assistantResponse(bot, answers, chatId);
};
