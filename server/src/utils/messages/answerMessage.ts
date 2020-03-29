import {Answer} from "../../models/answer";

export const getAnswerMessage = ({answer, links, additionalAnswers, additionalLinks}: Answer): string => {
    const ourAnswer = answer
        ? `\n${answer}`
        : '';
    const ourLinks: string = links?.length
        ? `\n\nConsider these links: \n${links.join(',\n')}`
        : '';
    const additionalAnswer: string = additionalAnswers?.length
        ? `.\n\n${additionalAnswers.join(',\n')}`
        : '';
    const additionalLink: string = additionalLinks?.length
        ? `.\n\nMore links:\n${additionalLinks.join(',\n')}`
        : '';
    return `${ourAnswer}${ourLinks}${additionalAnswer}${additionalLink}`
};
