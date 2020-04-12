import {Country} from "../../../models/country.models";
import {CountrySituationInfo} from "../../../models/covid19.models";
import {SubscriptionStorage} from "../../../models/storage.models";
import {
    Subscription,
    SubscriptionType,
    UserSubscription,
    UserSubscriptionNotification
} from "../../../models/subscription.models";
import {registry} from "./messageRegistry";
import {getTelegramSubscriptions, setTelegramSubscription} from "./storage";
import {catchAsyncError} from "../../../utils/catchError";
import {logger} from "../../../utils/logger";
import {getErrorMessage} from "../../../utils/getLoggerMessages";
import {isCountrySituationHasChangedSinceLastData} from "../../../services/domain/subscriptions";
import {showCountrySubscriptionMessage} from "../../../messages/feature/subscribeMessages";

export const subscriptionNotifierHandler = async (countriesData: [number, Array<[Country, Array<CountrySituationInfo>]>]): Promise<void> => {
    const allUsersSubscriptions: SubscriptionStorage = await getTelegramSubscriptions();
    const [_, countriesInfo] = countriesData;
    const countriesInfoMap = new Map(
        countriesInfo
            .map(([country, countrySituations]) =>
                ([country.name.toLocaleLowerCase(), countrySituations]))
    );

    for (const [chatId, userSubscription] of Object.entries(allUsersSubscriptions)) {
        let userSubscriptionsUpdate: Array<UserSubscriptionNotification> = getUserActiveSubscriptionNotifications(
            countriesInfoMap,
            userSubscription.subscriptionsOn.filter((sub: Subscription) => sub.active)
        );

        if (!!userSubscriptionsUpdate?.length) {
            const [sendingNotificationErr, sendingNotificationResult] = await catchAsyncError(registry.sendUserNotification(
                parseInt(chatId, 10),
                userSubscriptionsUpdate
                    .map((subUp: UserSubscriptionNotification) =>
                        subUp.subscriptionMessage
                    ).join('\n\n'),
            ));
            if (!!sendingNotificationErr) {
                return logger.log('error', `${getErrorMessage(sendingNotificationErr)}. User ${chatId} notifications has not been send`);
            }

            const mergeAllUserSubscriptions: Array<Subscription> = (userSubscription as UserSubscription)
                .subscriptionsOn
                .map((sub: Subscription) => {
                    const updateUserSub = userSubscriptionsUpdate
                        .find(({subscription: {value, type, active}}: UserSubscriptionNotification) =>
                            active === sub.active && type === sub.type && value === sub.value);
                    if (updateUserSub) {
                        return updateUserSub.subscription;
                    }

                    return sub;
                });

            const [updatingUserSubscriptionErr, updatingUserSubscriptionResult] = await catchAsyncError(setTelegramSubscription({
                chat: userSubscription.chat,
                subscriptionsOn: mergeAllUserSubscriptions
            }));
            if (!!updatingUserSubscriptionErr) {
                return logger.log(
                    'error',
                    `${getErrorMessage(updatingUserSubscriptionErr)}. User ${chatId} notifications has not been updated. Thus, system will wrongly send more updates even that it's already sent such messages to a user`
                );
            }
        }
    }
};

const getUserActiveSubscriptionNotifications = (
    countriesInfoMap: Map<string, Array<CountrySituationInfo>>,
    userActiveSubscriptions: Array<Subscription>
): Array<UserSubscriptionNotification> => {
    let userSubscriptionNotifications: Array<UserSubscriptionNotification> = [];

    userActiveSubscriptions
        .forEach((subscription: Subscription) => {
            if (subscription.type === SubscriptionType.Country) { // TODO: Take into account timezone
                const userSubscriptionCountry = countriesInfoMap.get(subscription.value.toLocaleLowerCase());
                if (!userSubscriptionCountry) {
                    return;
                }

                const subscriptionCountryLastInfo: CountrySituationInfo = userSubscriptionCountry[userSubscriptionCountry.length - 1];
                if (subscription.lastReceivedData
                    && !isCountrySituationHasChangedSinceLastData(
                        subscriptionCountryLastInfo,
                        subscription.lastReceivedData
                    )) {
                    return;
                }

                userSubscriptionNotifications = [
                    ...userSubscriptionNotifications,
                    {
                        subscription: {
                            ...subscription,
                            lastReceivedData: subscriptionCountryLastInfo,
                            lastUpdate: Date.now(),
                        },
                        subscriptionMessage: showCountrySubscriptionMessage(
                            subscriptionCountryLastInfo,
                            subscription.lastReceivedData ?? {}
                        )
                    },
                ]
            }
        });

    return userSubscriptionNotifications;
};

