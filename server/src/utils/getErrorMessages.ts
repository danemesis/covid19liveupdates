export const getErrorMessage = ({ message, name, stack }: Error): string =>
    `[ERROR] ${name}, ${message}, ${stack}`;

export const getInfoMessage = (message: string): string => `[INFO] ${message}`;
