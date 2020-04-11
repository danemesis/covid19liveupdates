import {Subscription, UserSubscription} from "../../models/subscription.models";
import {getMessageForCountry} from "./countryMessages";
import {CountrySituationInfo} from "../../models/covid19.models";
import {getDiffMessage} from "../covid19Messages";

export const subscriptionManagerResponseMessage = (): string => {
    return `Easy way to manage your subscriptions 💌`
};

export const subscribeError = (message: string): string => {
    return `${message}, sorry 🙇🏽‍♂️`
};

export const subscriptionResultMessage = (message: string): string => {
    return `Cool, subscribed on ${message} 😎`;
};

export const showMySubscriptionMessage = (userSubscription: UserSubscription): string => {
    return `You're 🔔 subscribed on: `
        .concat(userSubscription.subscriptionsOn.map((sub: Subscription) => `${sub.value}`).join(', '))
};

export const showCountrySubscriptionMessage = (
    {name, confirmed, recovered, deaths, date}: CountrySituationInfo,
    {confirmed: prevConfirmed, recovered: prevRecovered, deaths: prevDeaths, date: prevDate}: CountrySituationInfo
): string => {
    return `🔔 `
        + getMessageForCountry({
            name,
            confirmed,
            recovered,
            deaths,
            lastUpdateDate: date,
        })
        + `\n\n📈 Country change, since ⏱️${prevDate}\n`
        + getDiffMessage({confirmed, recovered, deaths}, {
            confirmed: prevConfirmed,
            recovered: prevRecovered,
            deaths: prevDeaths
        })
};
