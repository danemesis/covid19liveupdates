import * as firebase from 'firebase';
import {
    Subscription,
    UserSubscription,
} from '../../models/subscription.models';
import { SubscriptionStorage } from '../../models/storage.models';
import * as TelegramBot from 'node-telegram-bot-api';
import User from '../../models/user.model';
import DataSnapshot = firebase.database.DataSnapshot;

export class Storage {
    private _messengerPrefix: string;
    constructor(messengerPrefix: string) {
        this._messengerPrefix = messengerPrefix;
    }

    async getRef<T>(reference?: string): Promise<T> {
        const snapshot = await firebase
            .database()
            .ref(`${this._messengerPrefix}${reference ? '/' + reference : ''}`)
            .once('value');
        return (snapshot.val() ?? {}) as T;
    }

    async setRef<T>(reference: string, obj: T): Promise<any> {
        return firebase
            .database()
            .ref(`${this._messengerPrefix}/${reference}`)
            .set(obj);
    }

    async getFullStorage<T>(): Promise<T> {
        const snapshot: DataSnapshot = await firebase
            .database()
            .ref()
            .once('value');
        return snapshot.val() ?? {};
    }

    async getMessengerStorage<T>(): Promise<T> {
        return this.getRef();
    }

    async getSubscriptions(): Promise<SubscriptionStorage> {
        return this.getRef<SubscriptionStorage>('subscriptions');
    }

    async getUserSubscriptions(chatId: number): Promise<UserSubscription> {
        return this.getRef<UserSubscription>(`subscriptions/${chatId}`);
    }

    async setSubscription(subscription: UserSubscription): Promise<void> {
        return this.setRef(
            `subscriptions/${subscription.chat.id}`,
            subscription
        );
    }

    listenSubscriptionsChanges(
        cb: (a: firebase.database.DataSnapshot, b?: string | null) => unknown
    ): (
        a: firebase.database.DataSnapshot | null,
        b?: string | null
    ) => unknown {
        return firebase
            .database()
            .ref(`${this._messengerPrefix}/subscriptions`)
            .on('value', cb);
    }

    async getActiveSubscriptions<T>(): Promise<SubscriptionStorage> {
        const subscriptionStorage = await this.getRef<SubscriptionStorage>(
            'subscriptions'
        );
        const activeSubscriptions: SubscriptionStorage = {};
        // TODO: Make filtering on Firebase level userSubscription?.subscriptionsOn?.filter((subscription: Subscription) => subscription.active)
        for (const [chatId, userSubscription] of Object.entries(
            subscriptionStorage
        )) {
            activeSubscriptions[chatId] = {
                ...userSubscription,
                subscriptionsOn: userSubscription?.subscriptionsOn?.filter(
                    (subscription: Subscription) => subscription.active
                ),
            };
        }

        return activeSubscriptions;
    }

    async getActiveUserSubscriptions(
        chatId: number
    ): Promise<UserSubscription> {
        const userSubscription = await this.getRef<UserSubscription>(
            `subscriptions/${chatId}`
        );
        return {
            ...userSubscription,
            subscriptionsOn: userSubscription?.subscriptionsOn?.filter(
                (sub: Subscription) => sub.active
            ),
        };
    }

    async setQueryToAnalyse(message: TelegramBot.Message): Promise<void> {
        return this.setRef(`analyse/${message.message_id}`, message);
    }

    async getAllUsers(): Promise<Array<User>> {
        return this.getRef('users');
    }

    async getUser(chatId: number): Promise<User> {
        return this.getRef(`users/${chatId}`);
    }

    async addUser(user: User): Promise<void> {
        return this.setRef(`users/${user.chatId}`, user);
    }
}

export const getNotificationMessage = (
    messengerPrefix: string
) => async (): Promise<string> => {
    const snapshot = await firebase
        .database()
        .ref(`${messengerPrefix}/notificationMessage`)
        .once('value');
    return snapshot.val() ?? {};
};
