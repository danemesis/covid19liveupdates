import {TELEGRAM_PREFIX} from "../models";
import {
    getMessengerStorage,
    getSubscription,
    getSubscriptions,
    listenSubscriptionsChanges,
    setSubscription,
} from "../../../services/domain/storage";
import * as firebase from "firebase";
import {SubscriptionStorage} from "../../../models/storage.models";
import {Subscription, SubscriptionType, UserSubscription} from "../../../models/subscription.models";
import {Country} from "../../../models/country.models";
import {CountrySituationInfo} from "../../../models/covid19.models";
import {getMessageForCountry} from "../../../messages/feature/countryMessages";
import {registry} from "./messageRegistry";

export const getTelegramFullStorage: Function = getMessengerStorage(TELEGRAM_PREFIX);
export const getTelegramSubscriptions: Function = getSubscriptions(TELEGRAM_PREFIX);
export const getTelegramUserSubscriptions: Function = getSubscription(TELEGRAM_PREFIX);
export const setTelegramSubscription: Function = setSubscription(TELEGRAM_PREFIX);

export const listenTelegramUsersSubscriptionsChanges: Function = listenSubscriptionsChanges(TELEGRAM_PREFIX);
export const telegramUsersSubscriptionsChangesHandler = (a: firebase.database.DataSnapshot, b?: string | null): unknown => {
    console.log('a', a, a.val());
    console.log('b', b);

    return '';
};

// TODO: Optimize, you can do it better
export const getTelegramSubscriptionsHandler = async (countriesData: [number, Array<[Country, Array<CountrySituationInfo>]>]): unknown => {
    const allSubscriptions: SubscriptionStorage = await getTelegramSubscriptions();
    const [_, countriesInfo] = countriesData;
    const countriesInfoMap = new Map(
        countriesInfo
            .map(([country, countrySituations]) => ([country.name.toLocaleLowerCase(), countrySituations]))
    );

    Object.entries(allSubscriptions)
        .forEach(([chatId, userSubscription]: [number, UserSubscription]) => {

            let userSubscriptionsUpdate = [];

            userSubscription.subscriptionsOn.forEach((subscription: Subscription) => {
                if (subscription.type === SubscriptionType.Country) { // TODO: Take into account timezone
                    const userSubscriptionCountry = countriesInfoMap.get(subscription.value.toLocaleLowerCase());
                    if (!userSubscriptionCountry) {
                        return;
                    }

                    const userSubscriptionCountryLastSituationInfo: CountrySituationInfo = userSubscriptionCountry[userSubscriptionCountry.length - 1];

                    if (new Date(subscription.lastUpdate).toISOString().split('T')[0] < userSubscriptionCountryLastSituationInfo.date) {
                        userSubscriptionsUpdate = [
                            ...userSubscriptionsUpdate,
                            getMessageForCountry({
                                name: userSubscriptionCountryLastSituationInfo.name,
                                confirmed: userSubscriptionCountryLastSituationInfo.confirmed,
                                recovered: userSubscriptionCountryLastSituationInfo.recovered,
                                deaths: userSubscriptionCountryLastSituationInfo.deaths,
                                lastUpdateDate: userSubscriptionCountryLastSituationInfo.date,
                            })
                        ]
                    }
                }
            });

            registry.sendUserNotification(chatId, userSubscriptionsUpdate.join('\n\n'));
        });

    return '';
};

