import {getChatId} from "../utils/chat";
import {UserRegExps} from "../../../models/constants";
import {getNumberEmoji} from "../../../utils/emoji";

const codesExplanations = new Map([
    [UserRegExps.All, 'Show all countries data'],
    [UserRegExps.Countries, 'Show all available countries I have'],
    [UserRegExps.Country, `Show data for any country. Just follow pattern ${UserRegExps.Country} [COUNTRY NAME]. Not case sensative`],
    [UserRegExps.Advices, 'I have some good advices for you how to stay safe & sound'],
    [UserRegExps.Assistant, `You can ask me some COVID-19 related question and I will try to help you. Just follow pattern /assistant [your question]. To see what assistant features available type just ${UserRegExps.Assistant}`],
    [UserRegExps.Help, 'Open help (this)'],
]);

export const showHelpInfo = (bot, message, chatId) => {
    bot.sendMessage(
        chatId,
        `Things I can do\n${
            Object.values(UserRegExps)
                .map((code: string, idx: number) => `${getNumberEmoji(idx)} ${code} ${codesExplanations.get(code)}`)
                .join('\n')
        }`
    );
};