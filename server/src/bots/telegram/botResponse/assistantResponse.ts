import {fetchAnswer, fetchKnowledgeMetainformation} from '../../../services/api/api-knowledgebase';
import {Answer} from '../../../models/knowledgebase/answer.models';
import {
    getAnswersOnQuestionMessage,
    getAssistantFeaturesMessage,
    noAnswersOnQuestionMessage
} from '../../../messages/feature/assistantMessages';
import {textAfterUserCommand} from '../../../utils/textAfterCommand';
import {isCommandOnly, isMatchingDashboardItem, isMessageStartsWithCommand} from '../../../utils/incomingMessages';
import {KnowledgebaseMeta} from '../../../models/knowledgebase/meta.models';
import {UserMessages} from '../../../models/constants';
import {CallBackQueryHandler} from '../models';

export const assistantStrategyResponse: CallBackQueryHandler = async (
    bot,
    message,
    chatId): Promise<void> => {
    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || isMatchingDashboardItem(message.text, UserMessages.Assistant)) {
        return showAssistantFeatures(bot, message, chatId) as Promise<void>;
    }

    return answerOnQuestion(bot, message, chatId) as Promise<void>;
};

export const showAssistantFeatures: CallBackQueryHandler = async (
    bot,
    message,
    chatId): Promise<void> => {
    const knowledgebaseMeta: KnowledgebaseMeta = await fetchKnowledgeMetainformation();
    return bot.sendMessage(
        chatId,
        getAssistantFeaturesMessage(knowledgebaseMeta)
    )
};

export const answerOnQuestion: CallBackQueryHandler = async (
    bot,
    message,
    chatId): Promise<void> => {
    const question = textAfterUserCommand(message.text);
    const answers: Array<Answer> = await fetchAnswer(question);

    if (!answers.length) {
        return assistantNoAnswerResponse(bot, message, chatId) as Promise<void>;
    }

    return assistantResponse(bot, answers, chatId);
};

export const assistantNoAnswerResponse: CallBackQueryHandler = async (
    bot,
    message,
    chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        noAnswersOnQuestionMessage()
    )
};

export const assistantResponse = async (bot, answers, chatId) => {
    return bot.sendMessage(
        chatId,
        getAnswersOnQuestionMessage(answers)
    );
};
