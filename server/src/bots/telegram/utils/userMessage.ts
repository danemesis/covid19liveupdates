const getUserName = ({first_name, last_name, username}): string => {
    return first_name ?? last_name ?? username ?? 'friend';
};

const greetUser = (from): string => {
    return `Hi, ${getUserName(from)}`;
};

export {
    getUserName,
    greetUser
}