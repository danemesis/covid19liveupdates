import {
    Subscription,
    UserSubscription,
} from '../../models/subscription.models';
import { getCountryMessage } from './countryMessages';
import { CountrySituationInfo } from '../../models/covid19.models';
import { getDiffMessage } from '../covid19Messages';
import { getLocalizedMessages } from '../../services/domain/localization.service';

export const getAlreadySubscribedMessage = (locale: string | null): string =>
    getLocalizedMessages(locale, 'You are already subscribed on the country');

export const subscriptionManagerResponseMessage = (locale: string): string =>
    getLocalizedMessages(locale, `Easy way to manage your subscriptions 💌`);

export const noSubscriptionsResponseMessage = (locale: string): string =>
    getLocalizedMessages(locale, `It seems you haven't subscribed for any 🥺`);

export const subscriptionResultMessage = (
    message: string,
    locale: string
): string => {
    return ` ${getLocalizedMessages(
        locale,
        'Cool, subscribed on'
    )} ${message} 😎`;
};

export const showMySubscriptionMessage = (
    userSubscription: UserSubscription,
    locale: string
): string => {
    return getLocalizedMessages(locale, `You're 🔔 subscribed on: `).concat(
        userSubscription.subscriptionsOn
            .map((sub: Subscription) => `${sub.value}`)
            .join(', ')
    );
};

export const getCountrySubscriptionMessage = (
    { name, confirmed, recovered, deaths, date }: Partial<CountrySituationInfo>,
    {
        confirmed: prevConfirmed,
        recovered: prevRecovered,
        deaths: prevDeaths,
        date: prevDate,
    }: Partial<CountrySituationInfo>,
    locale: string
): string => {
    return (
        `🔔 ` +
        getCountryMessage(locale, name, confirmed, recovered, deaths, date) +
        `\n\n📈 ${getLocalizedMessages(
            locale,
            'Country change, since'
        )} ⏱️${prevDate}\n` +
        getDiffMessage(
            locale,
            { confirmed, recovered, deaths },
            {
                confirmed: prevConfirmed,
                recovered: prevRecovered,
                deaths: prevDeaths,
            }
        )
    );
};
