import {getChatId} from "../utils/chat";
import {fetchAnswer, fetchKnowledgeMetainformation} from "../../../services/api/api-knowledgebase";
import {Answer} from "../../../models/knowledgebase/answer.models";
import {
    getAnswersOnQuestionMessage,
    getAssistantFeaturesMessage,
    noAnswersOnQuestionMessage
} from "../../../utils/messages/answerMessage";
import {textAfterUserCommand} from "../../../utils/textAfterCommand";
import {isCommandOnly, isMessageStartsWithCommand} from "../../../utils/incomingMessage";
import {KnowledgebaseMeta} from "../../../models/knowledgebase/meta.models";
import {UserMessages} from "../../../models/constants";

export const assistantStrategy = (bot, message, chatId) => {
    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || message.text === UserMessages.Assistant) {
        return showAssistantFeatures(bot, message)
    }

    return answerOnQuestion(bot, message, chatId);
};

export const showAssistantFeatures = (bot, message) => {
    fetchKnowledgeMetainformation()
        .then((meta: KnowledgebaseMeta) =>
            bot.sendMessage(
                getChatId(message),
                getAssistantFeaturesMessage(meta)
            )
        )
};

export const answerOnQuestion = (bot, message, chatId) => {
    const question = textAfterUserCommand(message.text);
    fetchAnswer(question)
        .then((answers: Array<Answer>) => {
            if (!answers.length) {
                return bot.sendMessage(
                    chatId,
                    noAnswersOnQuestionMessage()
                )
            }

            return bot.sendMessage(
                chatId,
                getAnswersOnQuestionMessage(answers)
            );
        });
};