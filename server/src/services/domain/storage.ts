import * as firebase from 'firebase';
import {
    Subscription,
    UserSubscription,
} from '../../models/subscription.models';
import { SubscriptionStorage } from '../../models/storage.models';
import * as TelegramBot from 'node-telegram-bot-api';
import { User } from '../../models/user.model';
import DataSnapshot = firebase.database.DataSnapshot;

export class Storage {
    constructor(private messengerPrefix: string) {}

    public async getRef<T>(reference?: string): Promise<T> {
        const snapshot = await firebase
            .database()
            .ref(`${this.messengerPrefix}${reference ? '/' + reference : ''}`)
            .once('value');
        return (snapshot.val() ?? {}) as T;
    }

    public async setRef<T>(reference: string, obj: T): Promise<any> {
        return firebase
            .database()
            .ref(`${this.messengerPrefix}/${reference}`)
            .set(obj);
    }

    public async getFullStorage<T>(): Promise<T> {
        const snapshot: DataSnapshot = await firebase
            .database()
            .ref()
            .once('value');
        return snapshot.val() ?? {};
    }

    public async getMessengerStorage<T>(): Promise<T> {
        return this.getRef();
    }

    public async getSubscriptions(): Promise<SubscriptionStorage> {
        return this.getRef<SubscriptionStorage>('subscriptions');
    }

    public async getActiveSubscriptions<T>(): Promise<SubscriptionStorage> {
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

    public async getUserSubscriptions(
        chatId: number
    ): Promise<UserSubscription> {
        return this.getRef<UserSubscription>(`subscriptions/${chatId}`);
    }

    public async setSubscription(
        subscription: UserSubscription
    ): Promise<void> {
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
            .ref(`${this.messengerPrefix}/subscriptions`)
            .on('value', cb);
    }

    public async getActiveUserSubscriptions(
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

    public async setQueryToAnalyse(
        message: TelegramBot.Message
    ): Promise<void> {
        return this.setRef(`analyse/${message.message_id}`, message);
    }

    public async getNotificationMessage(): Promise<string> {
        return this.getRef('notificationMessage');
    }

    public async getAllUsers(): Promise<Array<User>> {
        return this.getRef('users');
    }

    public async getUser(chatId: number): Promise<User> {
        return this.getRef(`users/${chatId}`);
    }

    public async addUser(user: User): Promise<void> {
        return this.setRef(`users/${user.chatId}`, user);
    }

    public async updateUser(user: User): Promise<void> {
        const prevUser: User = await this.getUser(user.chatId);
        return this.addUser({
            ...prevUser,
            ...user,
        });
    }
}
