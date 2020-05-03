export const TIMES = {
    MILLISECONDS_IN_SECOND: 1000,
    MILLISECONDS_IN_MINUTE: 60000,
    MILLISECONDS_IN_HOUR: 3600000,
};
export const COVID19_FETCH_SALT = TIMES.MILLISECONDS_IN_MINUTE;

export const CONSOLE_LOG_EASE_DELIMITER: string = '==============> ';
export const CONSOLE_LOG_DELIMITER: string = '\n\n==============> ';

export enum CustomSubscriptions {
    SubscribeMeOn = `Subscribe me on`,
    UnsubscribeMeFrom = `Unsubscribe me from`,
}

export enum UserRegExps {
    Start = '/start',
    Assistant = '/assistant',
    CountriesData = '/countries',
    AvailableCountries = '/available',
    CountryData = '/country',
    Trends = '/trends',
    Advice = '/advice',
    Subscribe = '/subscribe',
    Unsubscribe = '/unsubscribe',
    Help = '/help',
}

export enum UserSettingsRegExps {
    Language = '/language',
}

export enum UserActionsRegExps {
    Close = '/close',
}

export enum UserInlineActions {
    NotNow = 'Not now',
    Later = 'Later',
    Close = 'Close',
    Next = `Next`,
    Previous = 'Previous',
}

export const DEFAULT_LOCALE: string = 'en';

// TODO: Remove IK handling on those, add
// usage of simple UserRegExps (add to them one if missing)
export enum UserMessages {
    Assistant = 'Assistant 👦',
    CountriesData = 'Countries data 🌍',
    AvailableCountries = 'Countries we track',
    GetAdviceHowToBehave = 'Advice how not to 😷',
    SubscriptionManager = 'Subscriptions 💌',
    Existing = 'Existing',
    Unsubscribe = 'Unsubscribe',
    Language = 'Language',
    Help = 'ℹ What can you do?',
}

export enum Continents {
    Asia = 'Asia',
    Europe = 'Europe',
    Africa = 'Africa',
    Americas = 'Americas',
    Oceania = 'Oceania',
    Other = 'Other',
}

export enum Frequency {
    Weekly = 'weekly',
    Monthly = 'monthly',
    WholePeriod = 'wholeperiod',
}

export enum Status {
    Confirmed = 'active',
    Deaths = 'deaths',
    Recovered = 'recovered',
}

export enum LogLevel {
    //   Emerg = 'emerg',
    //   Alert = 'alert',
    //   Crit = 'crit',
    Error = 'error',
    Warning = 'warn',
    //   Notice = 'notice',
    Info = 'info',
    Debug = 'debug', // ????????
    //   Trace = 'trace'
}

export enum LogCategory {
    Command = 'Command',
    Covid19DataUpdate = 'Covid19DataUpdate',
    Countries = 'Countries',
    MoreThenOneAvailableResponse = 'MoreThenOneAvailableResponse',
    NoSuitableResponseToUser = 'NoSuitableResponseToUser',
    SubscriptionNotifierHandler = 'SubscriptionNotifierHandler',
    SubscriptionNotifierGeneral = 'SubscriptionNotifierGeneral',
    SubscriptionNotifier = 'SubscriptionNotifier',
    Assistant = 'Assistant',
    Scheduler = 'Scheduler',
    Settings = 'Settings',
    SettingsLanguage = 'SettingsLanguage',

    // service types
    TelegramError = 'TelegramError',
    WebhookError = 'WebhookError',
    PollingError = 'PollingError',
}

export enum Emojii {
    Info = 'ℹ',
    Check = ' ☑️',
    Previous = '⏮️',
    Next = '⏭️',
    Settings = '🔧',
}
