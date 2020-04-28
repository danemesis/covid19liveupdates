import {
    Subscription,
    UserSubscription,
} from '../../models/subscription.models';
import { getCountryMessage } from './countryMessages';
import { CountrySituationInfo } from '../../models/covid19.models';
import { getDiffMessage } from '../covid19Messages';
import { getLocalizedMessage } from '../../services/domain/localization.service';

export const ALREADY_SUBSCRIBED_MESSAGE: string =
    'You are already subscribed on the country';

export const subscriptionManagerResponseMessage = (locale: string): string =>
    getLocalizedMessage(locale, `Easy way to manage your subscriptions 💌`);

export const noSubscriptionsResponseMessage = (locale: string): string =>
    getLocalizedMessage(locale, `It seems you haven't subscribed for any 🥺`);

export const subscriptionResultMessage = (
    message: string,
    locale: string
): string => {
    return ` ${getLocalizedMessage(
        locale,
        'Cool, subscribed on'
    )} ${message} 😎`;
};

export const showMySubscriptionMessage = (
    userSubscription: UserSubscription,
    locale: string
): string => {
    return getLocalizedMessage(locale, `You're 🔔 subscribed on: `).concat(
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
        getCountryMessage(name, confirmed, recovered, deaths, date) +
        `\n\n📈 ${getLocalizedMessage(
            locale,
            'Country change, since'
        )} ⏱️${prevDate}\n` +
        getDiffMessage(
            { confirmed, recovered, deaths },
            {
                confirmed: prevConfirmed,
                recovered: prevRecovered,
                deaths: prevDeaths,
            }
        )
    );
};
