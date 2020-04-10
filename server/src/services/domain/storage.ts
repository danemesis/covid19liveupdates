import * as firebase from 'firebase';
import {UserSubscription} from "../../models/storage.models";
import DataSnapshot = firebase.database.DataSnapshot;

export const getStorage = <T>(messengerPrefix: string): Function => async <T>(): Promise<T> => {
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

export const getSubscriptions = (messengerPrefix: string) => async (): Promise<DataSnapshot> => {
    return firebase.database().ref(`${messengerPrefix}/subscriptions`).once('value');
};

export const getSubscription = (messengerPrefix: string) => async <T>(chatId: number): Promise<T> => {
    const snapshot = await firebase.database().ref(`${messengerPrefix}/subscriptions/${chatId}`).once('value');
    return snapshot.val();
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
