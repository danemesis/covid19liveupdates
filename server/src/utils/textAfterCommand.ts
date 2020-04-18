export const textAfterUserCommand = (message: string): string =>
    message.slice(message.indexOf(' ')).trim();
