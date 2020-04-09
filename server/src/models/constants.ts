export const TIMES = {
    MILLISECONDS_IN_HOUR: 3600000,
};

export const CONSOLE_LOG_EASE_DELIMITER: string = '==============> ';
export const CONSOLE_LOG_DELIMITER: string = '\n\n==============> ';

export enum CustomSubscriptions {
    SubscribeMeOn = 'Subscribe on'
}

export enum UserRegExps {
    Start = "/start",
    Assistant = '/assistant',
    CountriesData = '/countries',
    AvailableCountries = '/available',
    CountryData = '/country',
    Advice = '/advice',
    Unsubscribe = '/unsubscribe',
    Subscribe = '/subscribe',
    Help = '/help'
}

export enum UserMessages {
    Assistant = 'Assistant 👦',
    CountriesData = 'Countries data 🌍',
    AvailableCountries = 'Countries we track',
    GetAdvicesHowToBehave = 'Advice how not to 😷',
    MySubscriptions = 'My subscriptions 💌',
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