import * as i18n from 'i18n';

/**
 * When you want to localize your message, you need to
 * @param locale
 * Which is locale you want to have at the end. When locale is null
 * it will fetch default system language.
 * @param messages
 * is either Array of messages you want to translate
 * or Array of Arrays, where the first parameter is message,
 * all consequent are parameters for the message
 *
 * @example
 * 1) getLocalizedMessage('ua', ['this message will be translated into Ukrainian'])
 * 2) getLocalizedMessage(
 * 'ua',
 * ['this %s will be translated into Ukrainian with two %s', 'message', 'parameters']
 * ) will be: "this message will be translated into Ukrainian with two parameters"
 * in Ukrainian
 */
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

export const getLocalized = (locale: string | null, message: string): string =>
    getLocalizedMessage(locale, [message])[0];
