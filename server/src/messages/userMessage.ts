const FIRST_MESSAGE_EXPLANATION: string =
    'I can show you available data about COVID-19 🦠🤒 in all countries where it\'s registered.';

export const getUserName = ({ first_name, last_name, username }): string => {
    return first_name ?? last_name ?? username ?? 'friend';
};

export const greetUser = (from): string => {
    return `Hi, ${getUserName(from)}. ${FIRST_MESSAGE_EXPLANATION}`;
};

export const noResponseForUserMessage = (message: string): string => {
    return `We do not have any response for you as we didn't understand you, 🤦\nHowever, we add your query, we will learn how to respond on ${message}`;
};
