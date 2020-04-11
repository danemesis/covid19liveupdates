export const getErrorMessage = ({message, name, stack}: Error): string =>
    `[ERROR] ${name}, ${message}, ${stack}`;
