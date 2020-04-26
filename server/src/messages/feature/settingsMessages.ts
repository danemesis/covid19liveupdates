export const chooseLanguageMessage = (): string => 'Choose language';

export const languageIsNotSupportableMessage = (): Array<string> => [
    'Language is not supported 😔',
    '. Choose from the list',
];

export const cannotSetupLanguageMessage = (locale: string): Array<string> => [
    `Sorry, I cannot setup the ${locale} for you. I am really sorry  🙇🏽`,
    `. Probably my database is out of reach. Try latter`,
];

export const languageHasBeenSuccessfullySetup = (): string =>
    `Language has been successfully installed 👌`
