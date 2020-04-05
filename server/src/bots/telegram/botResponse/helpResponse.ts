import {UserRegExps} from "../../../models/constants";
import {getNumberEmoji} from "../../../utils/emoji";

const codesExplanations = new Map([
    [UserRegExps.Start, 'My greetings 👋'],
    [UserRegExps.Assistant, `Overall and all, I am your personal assistant 👦. You can ask me some COVID-19 related question and I will try to help you. Just follow pattern /assistant [your question]. To see my features available type just ${UserRegExps.Assistant}`],
    [UserRegExps.All, 'Show all countries 🌍 COVID-19 data'],
    [UserRegExps.Countries, 'Show all available countries 🌍 I have (on all continents 🗺️)'],
    [UserRegExps.Country, `Show data for any country. Just follow pattern ${UserRegExps.Country} [COUNTRY NAME]. Not case sensative`],
    [UserRegExps.Advices, 'I have some good advices for you how to stay safe & sound'],
    [UserRegExps.Help, 'Open help (this) ℹ'],
]);

export const showHelpInfo = async (bot, message, chatId) => {
    return bot.sendMessage(
        chatId,
        `ℹ Things I can do are\n${
            Object.values(UserRegExps)
                .map((code: string, idx: number) => `${getNumberEmoji(idx)} ${code} ${codesExplanations.get(code)}`)
                .join('\n')
        }`
    );
};