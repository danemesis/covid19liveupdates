import * as firebase from 'firebase';
import {UserSubscription} from "../../models/storage.models";
import DataSnapshot = firebase.database.DataSnapshot;

export const getFullStorage = async <T>(): Promise<T> => {
    const snapshot: DataSnapshot = await firebase.database().ref('').once('value');
    return snapshot.val();
};

export const listenUsersSubscriptionsChanges = (
    cb: (a: firebase.database.DataSnapshot, b?: string | null) => unknown
): (a: firebase.database.DataSnapshot | null, b?: string | null) => unknown => {
    return firebase.database()
        .ref('subscriptions')
        .on('value', cb);
};

export const getUsersSubscriptions = async (): Promise<DataSnapshot> => {
    return firebase.database().ref('subscriptions').once('value');
};

export const getUserSubscription = async <T>(chatId: number): Promise<T> => {
    const snapshot = await firebase.database().ref(`subscriptions/${chatId}`).once('value');
    return snapshot.val();
};

export const setUserSubscriptionToStorage = async <T>(
    {chat, subscriptionsOn}: UserSubscription
): Promise<T> => {
    return firebase.database()
        .ref('subscriptions/' + chat.id)
        .set(({
            chat,
            subscriptionsOn
        }))
};
