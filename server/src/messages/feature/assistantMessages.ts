import { Answer } from '../../models/knowledgebase/answer.models';
import { KnowledgebaseMeta } from '../../models/knowledgebase/meta.models';
import { getNumberEmoji } from '../../utils/emoji';
import { UserRegExps } from '../../models/constants';
import { getLocalizedMessages } from '../../services/domain/localization.service';

export const getAssistantFeaturesMessage = (
    locale: string | null,
    { questions, categories }: KnowledgebaseMeta
): string => {
    const typicalQuestions: string = `\n\n${getLocalizedMessages(
        locale,
        'Typically, people ask me'
    )} 🧐\n${questions
        .map((v, idx) => `${getNumberEmoji(idx)} ${v}`)
        .join('\n')}`;
    const toAsk = `\n\nℹ ${getLocalizedMessages(
        locale,
        'If you have a question, type'
    )} ${UserRegExps.Assistant} [question]`;
    return `ℹ ${getLocalizedMessages(
        locale,
        'My knowledge base'
    )} 📚 ${getLocalizedMessages(locale, 'has')} ${
        categories.length
    } ${getLocalizedMessages(locale, 'categories')}: ${categories.join(
        ', '
    )}${typicalQuestions}${toAsk}`;
};

export const getAssistantIsOnLunchMessage = (locale: string | null) =>
    getLocalizedMessages(
        locale,
        'Assistant is having lunch 🍜 right now. He will be back 🔜'
    );

export const noAnswersOnQuestionMessage = (locale: string | null): string => {
    return getLocalizedMessages(
        locale,
        'Sorry, but I don\'t have the answer for your question 🤦‍♂️. However, you just made me better, as I will have it shortly, thank you 😉'
    );
};

export const getAnswersOnQuestionMessage = (
    locale: string | null,
    answers: Array<Answer>
): string => {
    const messageIfMoreThanOneAnswer: string =
        answers.length > 1
            ? `${getLocalizedMessages(locale, [
                  ['I have %s answers on your', answers.length],
                  '❓\n',
              ]).join('')}`
            : '';
    return `${messageIfMoreThanOneAnswer}${answers
        .map((answer) => getAnswerMessage(locale, answer))
        .join('\n\n')}`;
};

export const getAnswerMessage = (
    locale: string | null,
    { answer, links, additionalAnswers, additionalLinks }: Answer
): string => {
    const ourAnswer = answer ? `\n🙋 ${answer}` : '\n🙋';
    const ourLinks: string = links?.length
        ? `\n🔗 ${getLocalizedMessages(
              locale,
              'Consider these links'
          )}: \n${links.join(',\n')}`
        : '';
    const additionalAnswer: string = additionalAnswers?.length
        ? `.\n\n${additionalAnswers.join(',\n')}`
        : '';
    const additionalLink: string = additionalLinks?.length
        ? `.\n🔗🔗🔗${getLocalizedMessages(
              locale,
              'More links'
          )}:\n${additionalLinks.join(',\n')}`
        : '';
    return `${ourAnswer}${ourLinks}${additionalAnswer}${additionalLink}`;
};
