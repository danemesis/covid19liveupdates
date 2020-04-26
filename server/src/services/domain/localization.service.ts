import * as i18n from 'i18n';

export const getLocalizedMessage = (
    locale: string | null,
    messages: Array<string | Array<string>>
): Array<string> =>
    messages.map((message) => {
        if (locale) {
            if (typeof message === 'string') {
                return i18n.getCatalog(locale)[message] ?? message;
            }

            // Otherwise it's message with parameters
            return (
                i18n.__(
                    i18n.getCatalog(locale)[message[0]],
                    ...message.slice(1)
                ) ?? message
            );
        }

        // Or take default. Will leave it as it if no translation find
        return i18n.__(message) ?? message;
    });
