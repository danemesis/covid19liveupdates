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

export const assistantStrategyResponse = (bot, message, chatId) => {
    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || isMatchingDashboardItem(message.text, UserMessages.Assistant)) {
        return showAssistantFeatures(bot, message, chatId)
    }

    return answerOnQuestion(bot, message, chatId);
};

export const showAssistantFeatures = async (bot, message, chatId) => {
    const knowledgebaseMeta: KnowledgebaseMeta = await fetchKnowledgeMetainformation();
    bot.sendMessage(
        chatId,
        getAssistantFeaturesMessage(knowledgebaseMeta)
    )
};

export const answerOnQuestion = async (bot, message, chatId) => {
    const question = textAfterUserCommand(message.text);
    const answers: Array<Answer> = await fetchAnswer(question);

    if (!answers.length) {
        return assistantNoAnswerResponse(bot, message, chatId);
    }

    return assistantResponse(bot, answers, chatId);
};

export const assistantNoAnswerResponse = async (bot, message, chatId) => {
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
