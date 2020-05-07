export const DEFAULT_USER_SETTINGS: User = {
    chatId: undefined,
    userName: undefined,
    firstName: undefined,
    lastName: undefined,
    startedOn: Date.now(),
    settings: {
        locale: null,
    },
    state: {
        interruptedCommand: null,
    },
};

export interface User {
    chatId: number | string;
    userName: string;
    firstName: string;
    lastName: string;
    startedOn: number;
    settings: UserSettings;
    state: UserState;
}

export interface UserSettings {
    locale: string;
}

export interface UserState {
    interruptedCommand: string | null;
}
