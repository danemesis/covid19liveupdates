import {UserRegExps} from '../../models/constants';
import {getNumberEmoji} from '../../utils/emoji';

const codesExplanations = new Map([
    [UserRegExps.Start,
        'My greetings 👋'
    ],
    [UserRegExps.Assistant,
        `Overall and all, I am your personal assistant 👦. You can ask me some COVID-19 related question and I will try to help you. Just follow a pattern /assistant [your question]. To see my features available type just ${UserRegExps.Assistant}`
    ],
    [UserRegExps.CountriesData,
        'Show all countries 🌍 COVID-19 data'
    ],
    [UserRegExps.AvailableCountries,
        'Show all available countries 🌍 I have (on all continents 🗺️)'
    ],
    [UserRegExps.CountryData,
        `Show data for any country. Just follow a pattern ${UserRegExps.CountryData} [country name]`]
    ,
    [UserRegExps.Advice,
        'I have some good advices for you how to stay safe & sound'
    ],
    [UserRegExps.Subscribe,
        `Subscribe to a country for updates 💌. Just follow a pattern ${UserRegExps.Subscribe} [country name]`
    ],
    [UserRegExps.Unsubscribe,
        `Unsubscribe from any of your subscriptions. Just follow a pattern ${UserRegExps.Unsubscribe} [country name]. Alternatively, open Manager from the Dashboard`
    ],
    [UserRegExps.Help,
        'Open help (this) ℹ'
    ],
]);

const USING_DATASOURCES: string =
    `COVID-19 data source we are using is operated by the Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE).`
    + ` JSON-based wrap is provided by pomber/covid19 library available on GitHub. Information is updated daily`;

export const getHelpMessage = (): string => `ℹ Things I can do are\n${
    Object.values(UserRegExps)
        .map((userRegerxp: string, idx: number) => `${getNumberEmoji(idx)} ${userRegerxp} ${codesExplanations.get(userRegerxp)}`)
        .join('\n')
        .concat(`\n\n${USING_DATASOURCES}`)
}`;
