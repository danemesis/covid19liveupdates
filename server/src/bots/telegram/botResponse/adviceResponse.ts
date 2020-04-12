import {
    alternativeGreetings,
    encouragingMessage,
    getCovid19ExplanationVideo,
    socialDistancing,
    suggestedBehaviors
} from '../../../messages/feature/adviceMessages';

export const showAdvicesHowToBehaveResponse = (bot, message, chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        `ℹ Suggested Behaviors for ${getCovid19ExplanationVideo()}
        ${suggestedBehaviors()} \nℹ Social Distancing
        ${socialDistancing()} \nℹ Alternative Greetings
        ${alternativeGreetings()} \n${encouragingMessage()}
        `,
        {parse_mode: 'HTML'}
    );
};
