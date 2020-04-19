import {
    fetchAnswer,
    fetchKnowledgeMetainformation,
} from '../../../services/api/api-knowledgebase';
import { Answer } from '../../../models/knowledgebase/answer.models';
import {
    getAnswersOnQuestionMessage,
    getAssistantFeaturesMessage,
    noAnswersOnQuestionMessage,
} from '../../../messages/feature/assistantMessages';
import { KnowledgebaseMeta } from '../../../models/knowledgebase/meta.models';
import { CallBackQueryHandlerWithCommandArgument } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const showAssistantFeatures: CallBackQueryHandlerWithCommandArgument = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    const knowledgebaseMeta: KnowledgebaseMeta = await fetchKnowledgeMetainformation();
    return bot.sendMessage(
        chatId,
        getAssistantFeaturesMessage(knowledgebaseMeta)
    );
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
