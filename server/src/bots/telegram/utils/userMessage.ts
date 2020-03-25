const FIRST_MESSAGE_EXPLANAITON: string = 'I can show you available for me data about COVID-19 countries. Just click on DASHBOARD. (I am constantly improving)';

const getUserName = ({first_name, last_name, username}): string => {
    return first_name ?? last_name ?? username ?? 'friend';
};

const greetUser = (from): string => {
    return `Hi, ${getUserName(from)}. ${FIRST_MESSAGE_EXPLANAITON}`;
};

export {
    getUserName,
    greetUser
}