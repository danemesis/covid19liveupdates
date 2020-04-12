import * as firebase from 'firebase';
import {Subscription, UserSubscription} from "../../models/subscription.models";
import {SubscriptionStorage} from "../../models/storage.models";
import DataSnapshot = firebase.database.DataSnapshot;

export const getFllStorage = async <T>(): Promise<T> => {
    const snapshot: DataSnapshot = await firebase.database().ref().once('value');
    return snapshot.val();
};

export const getMessengerStorage = <T>(messengerPrefix: string): Function => async <T>(): Promise<T> => {
    const snapshot: DataSnapshot = await firebase.database().ref(messengerPrefix).once('value');
    return snapshot.val();
};

export const listenSubscriptionsChanges = (messengerPrefix: string): Function => (
    cb: (a: firebase.database.DataSnapshot, b?: string | null) => unknown
): (a: firebase.database.DataSnapshot | null, b?: string | null) => unknown => {
    return firebase.database()
        .ref(`${messengerPrefix}/subscriptions`)
        .on('value', cb);
};

export const getSubscriptions = (messengerPrefix: string) => async <T>(): Promise<SubscriptionStorage> => {
    const snapshot = await firebase.database().ref(`${messengerPrefix}/subscriptions`).once('value');
    return snapshot.val();
};

export const getSubscription = (messengerPrefix: string) => async <T>(chatId: number): Promise<UserSubscription> => {
    const snapshot = await firebase.database().ref(`${messengerPrefix}/subscriptions/${chatId}`).once('value');
    return snapshot.val();
};

export const getActiveSubscription = (messengerPrefix: string) => async <T>(chatId: number): Promise<UserSubscription> => {
    const snapshot = await firebase.database().ref(`${messengerPrefix}/subscriptions/${chatId}`).once('value');
    const userSubscription: UserSubscription = snapshot.val() as UserSubscription;
    return {
        ...userSubscription,
        subscriptionsOn: userSubscription.subscriptionsOn.filter((sub: Subscription) => sub.active)
    };
};

export const setSubscription = (messengerPrefix: string) => async <T>(
    {chat, subscriptionsOn}: UserSubscription
): Promise<T> => {
    return firebase.database()
        .ref(`${messengerPrefix}/subscriptions/${chat.id}`)
        .set(({
            chat,
            subscriptionsOn
        }))
};

export const updateSubscription = (messengerPrefix: string) => async <T>(
    {chat, subscriptionsOn}: UserSubscription
): Promise<T> => {
    return firebase.database()
        .ref(`${messengerPrefix}/subscriptions/${chat.id}/subscriptionsOn`)
        .update(subscriptionsOn);
};
