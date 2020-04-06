import {
    alternativeGreetings,
    encouragingMessage,
    socialDistancing,
    suggestedBehaviors
} from "../../../messages/userMessage";

export const showAdvicesHowToBehave = (bot, message, chatId) => {
    bot.sendMessage(
        chatId,
        `ℹ Suggested Behaviors
        ${suggestedBehaviors()} \nℹ Social Distancing
        ${socialDistancing()} \nℹ Alternative Greetings
        ${alternativeGreetings()} \n${encouragingMessage()}
        `
    );
};