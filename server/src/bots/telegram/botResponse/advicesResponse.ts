import {getChatId} from "../utils/chat";
import {alternativeGreetings, encouragingMessage, socialDistancing, suggestedBehaviors} from "../../../utils/messages/userMessage";

export const showAdvicesHowToBehave = (bot, message) => {
    bot.sendMessage(
        getChatId(message),
        `Suggested Behaviors
        ${suggestedBehaviors()} \nSocial Distancing
        ${socialDistancing()} \nAlternative Greetings
        ${alternativeGreetings()} \n${encouragingMessage()}
        `
    );
};