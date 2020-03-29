import {getChatId} from "../utils/chat";
import {UserRegExps} from "../../../models/constants";
import {getNumberEmoji} from "../../../utils/emoji";

const codesExplanations = new Map([
    ['/countries', 'Show all countries data'],
    ['/available', 'Show all available countries I have'],
    ['/country', 'Show data for any country. Just follow pattern /country [COUNTRY NAME]. Not case sensative'],
    ['/advices', 'I have some good advices for you how to stay safe & sound'],
    ['/question', 'You can ask me some COVID-19 related question and I will try to help you. Just follow pattern /question [your question]'],
    ['/help', 'Open help (this)'],
]);

export const showHelpInfo = (bot, message) => {
    bot.sendMessage(
        getChatId(message),
        `Things I can do\n${
            Object.values(UserRegExps)
                .map((code: string, idx: number) => `${getNumberEmoji(idx)} ${code} ${codesExplanations.get(code)}`)
                .join('\n')
        }`
    );
};