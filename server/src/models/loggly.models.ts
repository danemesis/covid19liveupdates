export enum LogglyTypes {
    NoSuitableResponseToUser = 'NoSuitableResponseToUser'
}

export interface LogglyModels extends Object {
    type: LogglyTypes;
    message?: string;
}
