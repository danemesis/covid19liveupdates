const getUserName = ({first_name, last_name, username}): string => {
    return first_name ?? last_name ?? username ?? 'Друже';
};

const greetUser = (from): string => {
    return `Привіт ${getUserName(from)}`;
};

export {
    getUserName,
    greetUser
}