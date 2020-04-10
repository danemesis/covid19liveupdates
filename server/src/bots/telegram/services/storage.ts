import {TELEGRAM_PREFIX} from "../models";
import {
    getStorage,
    getSubscription,
    getSubscriptions,
    listenSubscriptionsChanges,
    setSubscription,
} from "../../../services/domain/storage";
import * as firebase from "firebase";

export const getTelegramFullStorage: Function = getStorage(TELEGRAM_PREFIX);
export const getTelegramSubscriptions: Function = getSubscriptions(TELEGRAM_PREFIX);
export const getTelegramUserSubscriptions: Function = getSubscription(TELEGRAM_PREFIX);
export const setTelegramSubscription: Function = setSubscription(TELEGRAM_PREFIX);

export const listenTelegramUsersSubscriptionsChanges: Function = listenSubscriptionsChanges(TELEGRAM_PREFIX);
export const telegramUsersSubscriptionsChangesHandler = (a: firebase.database.DataSnapshot, b?: string | null): unknown => {
    console.log('a', a, a.val());
    console.log('b', b);

    return '';
};
