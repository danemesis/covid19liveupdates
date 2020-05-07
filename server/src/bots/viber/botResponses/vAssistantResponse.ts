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
    ViberBot,
    ViberCallBackQueryHandlerWithCommandArgument,
    ViberCallBackQueryParameters,
    ViberTextMessage,
} from '../models';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import { LogCategory } from '../../../models/constants';
import { User } from '../../../models/user.model';
import { Message } from 'viber-bot';
import { vGetFullMenuKeyboard } from '../services/keyboard';
import { mapBackToRealViberChatId } from '../utils/getViberChatId';

export const vShowAssistantFeatures: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    user,
    chatId,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
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

    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(messageText),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};

export const vAssistantNoAnswerResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    chatId,
    user,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(noAnswersOnQuestionMessage(user.settings?.locale)),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};

export const vAssistantResponse = async (
    bot: ViberBot,
    answers: Array<Answer>,
    chatId: string,
    user: User
) => {
    return bot.sendMessage({ id: mapBackToRealViberChatId(chatId) }, [
        new Message.Text(
            getAnswersOnQuestionMessage(user.settings?.locale, answers)
        ),
        new Message.Keyboard(
            vGetFullMenuKeyboard(user.settings?.locale, chatId)
        ),
    ]);
};

export const vAssistantStrategyResponse: ViberCallBackQueryHandlerWithCommandArgument = async ({
    bot,
    message,
    chatId,
    user,
    commandParameter,
}: ViberCallBackQueryParameters): Promise<ViberTextMessage> => {
    if (!commandParameter) {
        return vShowAssistantFeatures({ bot, message, chatId, user });
    }

    const answers: Array<Answer> = await fetchAnswer(commandParameter);
    if (!answers.length) {
        return vAssistantNoAnswerResponse({ bot, message, chatId, user });
    }

    return vAssistantResponse(bot, answers, chatId, user);
};
