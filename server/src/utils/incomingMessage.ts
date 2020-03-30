export const isMessageStartsWithCommand = (message: string): boolean => message?.[0] === '/';
export const isCommandOnly = (message: string): boolean => message.split(' ').length === 1;
