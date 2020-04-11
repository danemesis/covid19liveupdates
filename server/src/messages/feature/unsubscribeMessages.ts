export const getUnsubscribeResponseMessage = (): string => {
    return 'Choose items to unsubscribe from';
};

export const unSubscribeError = (message: string): string => {
    return `${message}`
};

export const unsubscribeResultMessage = (message: string): string => {
    return `You have been unsubscribe from ${message}`;
};
