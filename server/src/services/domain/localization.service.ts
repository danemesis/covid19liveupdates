import * as i18n from 'i18n';

export const getLocalizedMessage = (
    locale: string | null,
    messages: Array<string>,
): string => {
    return messages
        .map(message =>
            i18n.getCatalog(locale)[message]
            ?? i18n.__(message), // Or take default
        )
        .join('');
};
