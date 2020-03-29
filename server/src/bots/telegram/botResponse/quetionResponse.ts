import {getChatId} from "../utils/chat";
import {fetchAnswer} from "../../../services/api/knowledgebase";
import {Answer} from "../../../models/answer";
import {getAnswerMessage} from "../../../utils/messages/answerMessage";

// TODO: Move to utils (text after code)
const getQuestionFromMessage = (userTextCode: string): string => userTextCode.slice(userTextCode.indexOf(' ')).trim();

export const answerOnQuestion = (bot, message) => {
    const question = getQuestionFromMessage(message.text);
    fetchAnswer(question)
        .then((answers: Array<Answer>) => {
            bot.sendMessage(
                getChatId(message),
                answers.map(getAnswerMessage).join('\n\n')
            );
        });
};