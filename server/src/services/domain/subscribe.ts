import {TelegramChat} from "../../bots/telegram/models";
import {getAvailableCountries} from "./covid19";
import {Country} from "../../models/country.models";
import {getTelegramUserSubscriptions, setTelegramSubscription} from "../../bots/telegram/services/storage";
import {SubscriptionType, UserSubscription} from "../../models/subscription.models";
import {SubscriptionStorage} from "../../models/storage.models";

/*
    @params
    Assume subscribeMeOn is just country name (for now)
 */
export const subscribeOn = async (chat: TelegramChat, subscribeMeOn: string): Promise<string> => {
    const availableCountries: Array<Country> = await getAvailableCountries();

    const subscribeMeOnCountry: Country = availableCountries.find((country: Country) =>
        country.name === subscribeMeOn);

    if (!subscribeMeOnCountry) {
        throw Error('Is not supported, yet')
    }

    const existingSubscriptions: Array<string> = (await getTelegramUserSubscriptions(chat.id) ?? {}).subscriptionsOn ?? [];

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

export const getUserSubscriptions = (
    chatId: number, allUsersSubscriptions: SubscriptionStorage
): UserSubscription => {
    const userSubscriptionKey = Object.keys(allUsersSubscriptions)
        .find(key => parseInt(key, 10) === chatId);
    return allUsersSubscriptions[userSubscriptionKey];
};
