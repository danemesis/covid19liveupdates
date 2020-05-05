import { getCountriesSituation } from './covid19';
import { Country } from '../../models/country.models';
import {
    Subscription,
    SubscriptionType,
} from '../../models/subscription.models';
import { catchAsyncError } from '../../utils/catchError';
import { getAlreadySubscribedMessage } from '../../messages/feature/subscribeMessages';
import { CountrySituationInfo } from '../../models/covid19.models';
import * as TelegramBot from 'node-telegram-bot-api';
import { isTextEqual } from '../../utils/isEqual';
import { getCountryNameFormat } from './countries';
import { telegramStorage } from '../../bots/telegram/services/storage';
import { User } from '../../models/user.model';

/*
    @params
    Assume subscribeMeOn is just country name (for now)
 */
export const subscribeOn = async (
    chat: TelegramBot.Chat,
    user: User,
    subscribeMeOn: string
): Promise<string> => {
    const subscribeMeOnTheCountry: string = getCountryNameFormat(subscribeMeOn);
    const availableCountries: Array<[
        Country,
        Array<CountrySituationInfo>
    ]> = await getCountriesSituation();

    const [country, countrySituations]: [
        Country,
        Array<CountrySituationInfo>
    ] = availableCountries.find(
        ([country, _]: [Country, Array<CountrySituationInfo>]) =>
            isTextEqual(country.name, subscribeMeOnTheCountry)
    );

    if (!country) {
        throw Error('Is not supported, yet');
    }

    // TODO: Remove Telegram dependency
    const existingSubscriptions: Array<Subscription> =
        ((await telegramStorage().getUserSubscriptions(chat.id)) ?? {})
            .subscriptionsOn ?? [];

    const checkIfAlreadySubscribed = existingSubscriptions
        .filter((subscription: Subscription) => subscription.active)
        .find((subscription: Subscription) =>
            isTextEqual(subscription.value, subscribeMeOnTheCountry)
        );
    if (!!checkIfAlreadySubscribed) {
        // TODO: it's not actually error, re-write it be not an error
        throw new Error(
            `${getAlreadySubscribedMessage(user.settings?.locale)}`
        );
    }

    await telegramStorage().setSubscription({
        chat,
        subscriptionsOn: [
            ...existingSubscriptions,
            {
                active: true,
                type: SubscriptionType.Country,
                value: country.name,
                lastReceivedData:
                    countrySituations[countrySituations.length - 1],
                lastUpdate: Date.now(),
            },
        ],
    });

    return country.name;
};

export const unsubscribeMeFrom = async (
    chat: TelegramBot.Chat,
    unsubscribeMeFrom: string
): Promise<string> => {
    const unsubscribeMeFromTheCountry: string = getCountryNameFormat(
        unsubscribeMeFrom
    );
    // TODO: Remove Telegram dependency
    const existingSubscriptions: Array<Subscription> =
        ((await telegramStorage().getUserSubscriptions(chat.id)) ?? {})
            .subscriptionsOn ?? [];
    let foundSubscription: Subscription;
    const updatedSubscriptions: Array<Subscription> = existingSubscriptions.map(
        (subscription: Subscription) => {
            if (isTextEqual(subscription.value, unsubscribeMeFromTheCountry)) {
                foundSubscription = subscription;
                subscription.active = false;
            }
            return subscription;
        }
    );
    if (!foundSubscription) {
        throw new Error('I was not able to find your subscription');
    }

    const [err, result] = await catchAsyncError(
        telegramStorage().setSubscription({
            chat,
            subscriptionsOn: updatedSubscriptions,
        })
    );

    if (err) {
        throw Error(
            'Issue with Subscription service. Try later or drop us a message. Sorry for inconvenience'
        );
    }

    return unsubscribeMeFromTheCountry;
};

export const isCountrySituationHasChangedSinceLastData = (
    { confirmed, deaths, recovered }: CountrySituationInfo,
    {
        confirmed: prevConfirmed,
        deaths: prevDeaths,
        recovered: prevRecovered,
    }: CountrySituationInfo
): boolean => {
    return (
        confirmed !== prevConfirmed ||
        deaths !== prevDeaths ||
        recovered !== prevRecovered
    );
};
