import {TelegramChat} from "../../bots/telegram/models";
import {getCountriesSituation} from "./covid19";
import {Country} from "../../models/country.models";
import {getTelegramUserSubscriptions, setTelegramSubscription} from "../../bots/telegram/services/storage";
import {Subscription, SubscriptionType} from "../../models/subscription.models";
import {catchAsyncError} from "../../utils/catchError";
import {ALREADY_SUBSCRIBED_MESSAGE} from "../../messages/feature/subscribeMessages";
import {CountrySituationInfo} from "../../models/covid19.models";

/*
    @params
    Assume subscribeMeOn is just country name (for now)
 */
export const subscribeOn = async (chat: TelegramChat, subscribeMeOn: string): Promise<string> => {
    const availableCountries: Array<[Country, Array<CountrySituationInfo>]> = await getCountriesSituation();

    const [subscribeMeOnCountry, countrySituations]: [Country, Array<CountrySituationInfo>] = availableCountries
        .find(([country, _]: [Country, Array<CountrySituationInfo>]) =>
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
                lastReceivedData: countrySituations[countrySituations.length - 1],
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

export const isCountrySituationHasChangedSinceLastData = (
    {confirmed, deaths, recovered}: CountrySituationInfo,
    {confirmed: prevConfirmed, deaths: prevDeaths, recovered: prevRecovered}: CountrySituationInfo,
): boolean => {
    return confirmed !== prevConfirmed
        || deaths !== prevDeaths
        || recovered !== prevRecovered
};
