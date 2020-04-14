export enum LogglyTypes {
    CommandError= 'CommandError',
    MoreThenOneAvailableResponse = 'MoreThenOneAvailableResponse',
    NoSuitableResponseToUser = 'NoSuitableResponseToUser'
}

export interface LogglyModels extends Object {
    type: LogglyTypes;
    message?: string;
}
