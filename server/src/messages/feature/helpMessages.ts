import {UserRegExps} from "../../models/constants";
import {getNumberEmoji} from "../../utils/emoji";

const codesExplanations = new Map([
    [UserRegExps.Start, 'My greetings 👋'],
    [UserRegExps.Assistant, `Overall and all, I am your personal assistant 👦. You can ask me some COVID-19 related question and I will try to help you. Just follow pattern /assistant [your question]. To see my features available type just ${UserRegExps.Assistant}`],
    [UserRegExps.CountriesData, 'Show all countries 🌍 COVID-19 data'],
    [UserRegExps.AvailableCountries, 'Show all available countries 🌍 I have (on all continents 🗺️)'],
    [UserRegExps.CountryData, `Show data for any country. Just follow pattern ${UserRegExps.CountryData} [country name]. Not case sensative`],
    [UserRegExps.Advice, 'I have some good advices for you how to stay safe & sound'],
    [UserRegExps.Help, 'Open help (this) ℹ'],
]);

export const getHelpMessage = (): string => `ℹ Things I can do are\n${
    Object.values(UserRegExps)
        .map((userRegerxp: string, idx: number) => `${getNumberEmoji(idx)} ${userRegerxp} ${codesExplanations.get(userRegerxp)}`)
        .join('\n')
}`;