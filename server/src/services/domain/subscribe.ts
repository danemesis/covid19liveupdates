import {TelegramChat} from "../../bots/telegram/models";
import {getAvailableCountries} from "./covid19";
import {Country} from "../../models/country.models";
import {setUserSubscriptionToStorage} from "./storage";

/*
    @params
    Assume subscribeMeOn is just country name (for now)
 */
export const subscribeOn = async (chat: TelegramChat, subscribeMeOn: string): Promise<unknown> => {
    const availableCountries: Array<Country> = await getAvailableCountries();

    const subscribeMeOnCountry: Country = availableCountries.find((country: Country) =>
        country.name === subscribeMeOn);

    if (!subscribeMeOnCountry) {
        throw Error('Is not supported, yet')
    }

    console.log('SUBSCRIBING', subscribeMeOnCountry.name);

    const setSubscribeUser = await setUserSubscriptionToStorage({
        chat,
        subscriptionsOn: [subscribeMeOnCountry.name]
    });

    console.log('SUBSCRIBED', setSubscribeUser);

    return setSubscribeUser;
};
