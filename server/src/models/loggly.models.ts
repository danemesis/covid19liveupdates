export enum LogglyTypes {
    CommandError = '[Error]Command',
    Covid19DataUpdateError = '[Error]Covid19DataUpdate',
    MoreThenOneAvailableResponseError = '[Error]MoreThenOneAvailableResponse',
    NoSuitableResponseToUserError = '[Error]NoSuitableResponseToUser',
    SubscriptionNotifierHandlerError = '[Error]SubscriptionNotifierHandler',
    SubscriptionNotifierGeneralError = '[Error]SubscriptionNotifierGeneralError',
    SubscriptionNotifierError = '[Error]SubscriptionNotifier',
    Covid19DataUpdateInfo = '[Info]Covid19DataUpdate',
    RemoveCommandFromMessageIfExistInfo = '[Info]removeCommandFromMessageIfExist',
}

export interface LogglyModels extends Object {
    type: LogglyTypes;
    message?: string;
}
