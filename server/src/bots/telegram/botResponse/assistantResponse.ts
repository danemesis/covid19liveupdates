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
import { textAfterUserCommand } from '../../../utils/textAfterCommand';
import {
    isCommandOnly,
    isMatchingDashboardItem,
    isMessageStartsWithCommand,
} from '../../../utils/incomingMessages';
import { KnowledgebaseMeta } from '../../../models/knowledgebase/meta.models';
import { UserMessages } from '../../../models/constants';
import { CallBackQueryHandler } from '../models';
import * as TelegramBot from 'node-telegram-bot-api';

export const assistantStrategyResponse: CallBackQueryHandler = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId?: number
): Promise<TelegramBot.Message> => {
    if (
        (isMessageStartsWithCommand(message.text) && isCommandOnly(message.text)) ||
        isMatchingDashboardItem(message.text, UserMessages.Assistant)
    ) {
        return showAssistantFeatures(bot, message, chatId) as Promise<TelegramBot.Message>;
    }

    return answerOnQuestion(bot, message, chatId) as Promise<TelegramBot.Message>;
};

export const showAssistantFeatures: CallBackQueryHandler = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    const knowledgebaseMeta: KnowledgebaseMeta = await fetchKnowledgeMetainformation();
    return bot.sendMessage(chatId, getAssistantFeaturesMessage(knowledgebaseMeta));
};

export const answerOnQuestion: CallBackQueryHandler = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
    chatId: number
): Promise<TelegramBot.Message> => {
    const question: string = textAfterUserCommand(message.text);
    const answers: Array<Answer> = await fetchAnswer(question);

    if (!answers.length) {
        return assistantNoAnswerResponse(bot, message, chatId) as Promise<TelegramBot.Message>;
    }

    return assistantResponse(bot, answers, chatId);
};

export const assistantNoAnswerResponse: CallBackQueryHandler = async (
    bot: TelegramBot,
    message: TelegramBot.Message,
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
