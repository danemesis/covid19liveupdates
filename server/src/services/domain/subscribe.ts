import {TelegramChat} from "../../bots/telegram/models";
import {getAvailableCountries} from "./covid19";
import {Country} from "../../models/country.models";
import {getUserSubscription, setUserSubscriptionToStorage} from "./storage";
import {UserSubscription} from "../../models/storage.models";

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

    const existingSubscriptions: UserSubscription = await getUserSubscription<UserSubscription>(chat.id);
    console.log('existingSubscriptions', existingSubscriptions);

    await setUserSubscriptionToStorage({
        chat,
        subscriptionsOn: [...existingSubscriptions.subscriptionsOn, subscribeMeOnCountry.name]
    });

    return subscribeMeOnCountry.name;
};
