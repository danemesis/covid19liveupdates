export const TIMES = {
    MILLISECONDS_IN_HOUR: 3600000,
};

export enum UserRegExps {
    All = '/countries',
    Countries = '/available',
    Country = '/country',
    Advices = '/advices',
    Assistant = '/assistant',
    Help = '/help'
}

export enum UserMessages {
    AllCountries = 'Countries data',
    CountriesAvailable = 'Countries we track',
    Assistant = 'Assistant',
    GetAdvicesHowToBehave = 'Get advices how to ...',
    Help = 'What can you do?'
}