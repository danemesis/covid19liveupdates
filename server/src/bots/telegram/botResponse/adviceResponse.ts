import {
    alternativeGreetings,
    encouragingMessage,
    socialDistancing,
    suggestedBehaviors
} from '../../../messages/userMessage';

export const showAdvicesHowToBehaveResponse = (bot, message, chatId): Promise<void> => {
    return bot.sendMessage(
        chatId,
        `ℹ Suggested Behaviors
        ${suggestedBehaviors()} \nℹ Social Distancing
        ${socialDistancing()} \nℹ Alternative Greetings
        ${alternativeGreetings()} \n${encouragingMessage()}
        `
    );
};