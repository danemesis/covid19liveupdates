import * as firebase from 'firebase';
import {UserSubscription} from "../../models/storage.models";
import DataSnapshot = firebase.database.DataSnapshot;

export const getFullStorage = async (): Promise<unknown> => {
    const snapshot: DataSnapshot = await firebase.database().ref('').once('value');
    return snapshot.val();
};

export const getSubscriptions = async (): Promise<DataSnapshot> => {
    return firebase.database().ref('subscriptions').once('value');
};

export const listenSubscriptions = (
    cb: (a: firebase.database.DataSnapshot, b?: string | null) => unknown
): (a: firebase.database.DataSnapshot | null, b?: string | null) => unknown => {
    return firebase.database()
        .ref('subscriptions')
        .on('value', cb);
};

export const subscribeUser = async ({chat, subscriptionsOn}: UserSubscription) => {
    return firebase.database().ref('subscriptions/' + chat.id).set(({
        chat,
        subscriptionsOn
    }))
};
