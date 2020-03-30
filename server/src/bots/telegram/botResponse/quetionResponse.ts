import {getChatId} from "../utils/chat";
import {fetchAnswer, fetchCategories, fetchKnowledgeBaseInfo} from "../../../services/api/knowledgebase";
import {Answer} from "../../../models/knowledgebase/answer";
import {getAnswerMessage, getAssistantFeaturesMessage} from "../../../utils/messages/answerMessage";
import {textAfterUserCommand} from "../../../utils/textAfterCommand";
import {isCommandOnly, isMessageStartsWithCommand} from "../../../utils/incomingMessage";
import {KnowledgebaseMeta} from "../../../models/knowledgebase/meta";
import {UserMessages} from "../../../models/constants";

export const assistantStrategy = (bot, message) => {
    if ((isMessageStartsWithCommand(message.text) && isCommandOnly(message.text))
        || message.text === UserMessages.Assistant) {
        return showAssistantFeatures(bot, message)
    }

    return answerOnQuestion(bot, message);
};

export const showAssistantFeatures = (bot, message) => {
    Promise.all([fetchKnowledgeBaseInfo(), fetchCategories(),])
        .then(([meta, categories]: [KnowledgebaseMeta, Array<string>]) =>
            bot.sendMessage(
                getChatId(message),
                getAssistantFeaturesMessage(meta, categories)
            )
        )
};

export const answerOnQuestion = (bot, message) => {
    const question = textAfterUserCommand(message.text);
    fetchAnswer(question)
        .then((answers: Array<Answer>) => {
            const messageIfMoreThanOneAnswer: string = answers.length > 1
                ? `I have ${answers.length} answers on your❓\n`
                : '';
            bot.sendMessage(
                getChatId(message),
                `${messageIfMoreThanOneAnswer}${answers.map(getAnswerMessage).join('\n\n')}`
            );
        });
};