export const TIMES = {
    MILLISECONDS_IN_HOUR: 3600000,
};

export const REXEX_ALL_CODES = /\/([^\s]+)/;

export const countriesCode = '/countries';

export enum UserRegExps {
    All = '/countries',
    Countries = '/available',
    Country = '/country',
    Advices = '/advices',
    Help = '/help'
}

export enum UserMessages {
    AllCountries = 'Countries data',
    CountriesAvailable = 'Countries available',
    GetAdvicesHowToBehave = 'Get advices how to ...',
    Help = 'What can you do?'
}