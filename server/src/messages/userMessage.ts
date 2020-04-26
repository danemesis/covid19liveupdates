import { User } from '../models/user.model';
import { getLocalizedMessage } from '../services/domain/localization.service';

const FIRST_MESSAGE_EXPLANATION: string =
    'I can show you available data about COVID-19 🦠🤒 in all countries where it\'s registered.';

export const getUserName = ({
    firstName,
    lastName,
    userName,
}: User): string => {
    return firstName ?? lastName ?? userName ?? 'friend';
};

export const greetUser = (locale: string | null, user: User): string => {
    return getLocalizedMessage(locale, [
        [`Hi, %s`, getUserName(user)],
        '. ',
        FIRST_MESSAGE_EXPLANATION,
    ]).join('');
};

export const noResponseForUserMessage = (message: string): string => {
    return `We do not have any response for you as we didn't understand you, 🤦\nHowever, we add your query, we will learn how to respond on ${message}`;
};
