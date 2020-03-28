import {getChatId} from "../utils/chat";
import {UserRegExps} from "../../../models/constants";

const codesExplanations = new Map([
    ['/countries', 'Show all countries data'],
    ['/available', 'Show all available countries I have'],
    ['/country', 'Show data for any country. Just follow pattern /country [COUNTRY NAME]. Not case sensative'],
    ['/advices', 'I have some good advices for you how to stay safe & sound'],
    ['/help', 'Open help (this)'],
]);

export const showHelpInfo = (bot, message) => {
    bot.sendMessage(
        getChatId(message),
        Object.values(UserRegExps)
            .map((code: string) => `${code} ${codesExplanations.get(code)}`)
            .join('\n')
    );
};