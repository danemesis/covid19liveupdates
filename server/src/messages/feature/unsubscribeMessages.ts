export const getUnsubscribeResponseMessage = (): string => {
    return 'Choose items to unsubscribe from';
};

export const unSubscribeErrorMessage = (message: string): string => {
    return `${message}, sorry 🙇🏽`;
};

export const unsubscribeResultMessage = (message: string): string => {
    return `You have been unsubscribed from ${message}`;
};
