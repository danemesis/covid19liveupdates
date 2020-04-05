export const TIMES = {
    MILLISECONDS_IN_HOUR: 3600000,
};

export enum UserRegExps {
    Start = "/start",
    Assistant = '/assistant',
    All = '/countries',
    Countries = '/available',
    Country = '/country',
    Advices = '/advices',
    Help = '/help'
}

export enum UserMessages {
    AllCountries = 'Countries data 🌍',
    CountriesAvailable = 'Countries we track',
    Assistant = 'Assistant 👦',
    GetAdvicesHowToBehave = 'Advices how not to  😷',
    Help = 'ℹ What can you do?'
}

export enum Continents {
    Asia = 'Asia',
    Europe = 'Europe',
    Africa = 'Africa',
    Americas = 'Americas',
    Oceania = 'Oceania',
    Other = 'Other'
}