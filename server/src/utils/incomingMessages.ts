export const isMessageStartsWithCommand = (text: string): boolean =>
    text?.[0] === '/';
