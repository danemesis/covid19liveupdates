export enum LogglyTypes {
    Command = 'Command',
    Covid19DataUpdate = 'Covid19DataUpdate',
    Countries = 'Countries',
    MoreThenOneAvailableResponse = 'MoreThenOneAvailableResponse',
    NoSuitableResponseToUser = 'NoSuitableResponseToUser',
    SubscriptionNotifierHandler = 'SubscriptionNotifierHandler',
    SubscriptionNotifierGeneral = 'SubscriptionNotifierGeneral',
    SubscriptionNotifier = 'SubscriptionNotifier',


    //service types
    TelegramError = 'TelegramError',
    WebhookError = 'WebhookError',
    PollingError = 'PollingError'
}

export interface LogglyModels extends Object {
    type: LogglyTypes;
    message?: string;
}
