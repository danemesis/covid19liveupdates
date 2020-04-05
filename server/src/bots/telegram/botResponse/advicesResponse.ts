import {
    alternativeGreetings,
    encouragingMessage,
    socialDistancing,
    suggestedBehaviors
} from "../../../utils/messages/userMessage";

export const showAdvicesHowToBehave = (bot, message, chatId) => {
    bot.sendMessage(
        chatId,
        `ℹ Suggested Behaviors
        ${suggestedBehaviors()} \nSocial Distancing
        ${socialDistancing()} \nAlternative Greetings
        ${alternativeGreetings()} \n${encouragingMessage()}
        `
    );
};