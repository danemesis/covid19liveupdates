import {TelegramChat} from "../../bots/telegram/models";
import {getAvailableCountries} from "./covid19";
import {Country} from "../../models/country.models";
import {
    getTelegramActiveUserSubscriptions,
    getTelegramUserSubscriptions,
    setTelegramSubscription
} from "../../bots/telegram/services/storage";
import {Subscription, SubscriptionType, UserSubscription} from "../../models/subscription.models";
import {SubscriptionStorage} from "../../models/storage.models";
import {catchAsyncError} from "../../utils/catchError";
import {ALREADY_SUBSCRIBED_MESSAGE} from "../../messages/feature/subscribeMessages";

/*
    @params
    Assume subscribeMeOn is just country name (for now)
 */
export const subscribeOn = async (chat: TelegramChat, subscribeMeOn: string): Promise<string> => {
    const availableCountries: Array<Country> = await getAvailableCountries();

    const subscribeMeOnCountry: Country = availableCountries.find((country: Country) =>
        country.name.toLocaleLowerCase() === subscribeMeOn.toLocaleLowerCase());

    if (!subscribeMeOnCountry) {
        throw Error('Is not supported, yet')
    }

    // TODO: Remove Telegram dependency
    const existingSubscriptions: Array<Subscription> = (await getTelegramUserSubscriptions(chat.id) ?? {})
        .subscriptionsOn ?? [];

    const checkIfAlreadySubscribed = existingSubscriptions
        .find((subscription: Subscription) => subscription.value === subscribeMeOn);
    if (!!checkIfAlreadySubscribed) {
        // TODO: it's not actually error, re-write it be not an error
        throw new Error(`${ALREADY_SUBSCRIBED_MESSAGE}`);
    }

    await setTelegramSubscription({
        chat,
        subscriptionsOn: [
            ...existingSubscriptions,
            {
                active: true,
                type: SubscriptionType.Country,
                value: subscribeMeOnCountry.name,
                lastUpdate: Date.now(),
            }
        ]
    });

    return subscribeMeOnCountry.name;
};

export const unsubscribeMeFrom = async (chat: TelegramChat, unsubscribeMeFrom: string): Promise<string> => {
    // TODO: Remove Telegram dependency
    const existingSubscriptions: Array<Subscription> = (await getTelegramUserSubscriptions(chat.id) ?? {})
        .subscriptionsOn ?? [];
    let foundSubscription: Subscription;
    const updatedSubscriptions: Array<Subscription> = existingSubscriptions
        .map((subscription: Subscription) => {
            if (subscription.value === unsubscribeMeFrom) {
                foundSubscription = subscription;
                subscription.active = false;
            }
            return subscription;
        });
    if (!foundSubscription) {
        throw new Error('I was not able to find your subscription');
    }

    const [err, result] = await catchAsyncError(setTelegramSubscription({
        chat,
        subscriptionsOn: updatedSubscriptions
    }));

    if (err) {
        throw Error('Issue with Subscription service. Try later or drop us a message. Sorry for inconvenience');
    }

    return unsubscribeMeFrom;
};

export const getConcreteUserSubscriptions = (
    chatId: number, allUsersSubscriptions: SubscriptionStorage
): UserSubscription => {
    const userSubscriptionKey = Object.keys(allUsersSubscriptions)
        .find(key => parseInt(key, 10) === chatId);
    return allUsersSubscriptions[userSubscriptionKey];
};
