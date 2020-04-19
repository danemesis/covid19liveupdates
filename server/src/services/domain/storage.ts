import * as firebase from 'firebase';
import { Subscription, UserSubscription } from '../../models/subscription.models';
import { SubscriptionStorage } from '../../models/storage.models';
import * as TelegramBot from 'node-telegram-bot-api';
import DataSnapshot = firebase.database.DataSnapshot;

export const getFllStorage = async <T>(): Promise<T> => {
    const snapshot: DataSnapshot = await firebase.database().ref().once('value');
    return snapshot.val() ?? {};
};

export const getMessengerStorage = <T>(messengerPrefix: string): Function => async <T>(): Promise<
    T
> => {
    const snapshot: DataSnapshot = await firebase.database().ref(messengerPrefix).once('value');
    return snapshot.val() ?? {};
};

export const listenSubscriptionsChanges = (messengerPrefix: string): Function => (
    cb: (a: firebase.database.DataSnapshot, b?: string | null) => unknown
): ((a: firebase.database.DataSnapshot | null, b?: string | null) => unknown) => {
    return firebase.database().ref(`${messengerPrefix}/subscriptions`).on('value', cb);
};

export const getSubscriptions = (messengerPrefix: string) => async <T>(): Promise<
    SubscriptionStorage
> => {
    const snapshot = await firebase
        .database()
        .ref(`${messengerPrefix}/subscriptions`)
        .once('value');
    return snapshot.val() ?? {};
};

export const getActiveSubscriptions = (messengerPrefix: string) => async <T>(): Promise<
    SubscriptionStorage
> => {
    const snapshot = await firebase
        .database()
        .ref(`${messengerPrefix}/subscriptions`)
        .once('value');
    const subscriptionStorage:
        | SubscriptionStorage
        | undefined = snapshot.val() as SubscriptionStorage;
    if (!subscriptionStorage) {
        return {};
    }

    const activeSubscriptions: SubscriptionStorage = {};
    // TODO: Make filtering on Firebase level userSubscription?.subscriptionsOn?.filter((subscription: Subscription) => subscription.active)
    for (const [chatId, userSubscription] of Object.entries(subscriptionStorage)) {
        activeSubscriptions[chatId] = {
            ...userSubscription,
            subscriptionsOn: userSubscription?.subscriptionsOn?.filter(
                (subscription: Subscription) => subscription.active
            ),
        };
    }

    return activeSubscriptions;
};

export const getUserSubscription = (messengerPrefix: string) => async <T>(
    chatId: number
): Promise<UserSubscription> => {
    const snapshot = await firebase
        .database()
        .ref(`${messengerPrefix}/subscriptions/${chatId}`)
        .once('value');
    return snapshot.val() ?? {};
};

export const getActiveUserSubscription = (messengerPrefix: string) => async <T>(
    chatId: number
): Promise<UserSubscription> => {
    const snapshot = await firebase
        .database()
        .ref(`${messengerPrefix}/subscriptions/${chatId}`)
        .once('value');
    const userSubscription: UserSubscription = snapshot.val() as UserSubscription;
    return {
        ...userSubscription,
        subscriptionsOn: userSubscription?.subscriptionsOn?.filter(
            (sub: Subscription) => sub.active
        ),
    };
};

export const setSubscription = (messengerPrefix: string) => async <T>({
    chat,
    subscriptionsOn,
}: UserSubscription): Promise<T> => {
    return firebase.database().ref(`${messengerPrefix}/subscriptions/${chat.id}`).set({
        chat,
        subscriptionsOn,
    });
};

export const setQueryToAnalyse = (messengerPrefix: string) => async <T>(
    message: TelegramBot.Message // I think it's OK to have this dependency here, we can have
    // different messengers intersection here
): Promise<T> => {
    return firebase.database().ref(`${messengerPrefix}/analyse/${message.message_id}`).set(message);
};
