import {Country} from "../../../models/country.models";
import {CountrySituationInfo} from "../../../models/covid19.models";
import {SubscriptionStorage} from "../../../models/storage.models";
import {
    Subscription,
    SubscriptionType,
    UserSubscription,
    UserSubscriptionNotification
} from "../../../models/subscription.models";
import {CONSOLE_LOG_DELIMITER} from "../../../models/constants";
import {registry} from "./messageRegistry";
import {getTelegramSubscriptions, updateTelegramSubscription} from "./storage";
import {catchAsyncError} from "../../../utils/catchError";
import {logger} from "../../../utils/logger";
import {getErrorMessage} from "../../../utils/getErrorMessage";
import {showCountrySubscriptionMessage} from "../../../messages/feature/subscribeMessages";
import {getConcreteUserSubscriptions} from "../../../services/domain/subscriptions";

export const subscriptionNotifierHandler = async (countriesData: [number, Array<[Country, Array<CountrySituationInfo>]>]): Promise<void> => {
    const allUsersSubscriptions: SubscriptionStorage = await getTelegramSubscriptions();
    const [_, countriesInfo] = countriesData;
    const countriesInfoMap = new Map(
        countriesInfo
            .map(([country, countrySituations]) =>
                ([country.name.toLocaleLowerCase(), countrySituations]))
    );

    for (const [chatId, userSubscription] of Object.entries(allUsersSubscriptions)) {
        let userSubscriptionsUpdate: Array<UserSubscriptionNotification> = getUserSubscriptionNotifications(
            countriesInfoMap,
            userSubscription.subscriptionsOn
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

            const subscriptionsOn = userSubscriptionsUpdate
                .map((subUp: UserSubscriptionNotification) => ({
                        ...subUp.subscription,
                        lastUpdate: Date.now(),
                    })
                );

            const [updatingUserSubscriptionErr, updatingUserSubscriptionResult] = await catchAsyncError(updateTelegramSubscription({
                chat: userSubscription.chat,
                subscriptionsOn
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

const getUserSubscriptionNotifications = (
    countriesInfoMap: Map<string, Array<CountrySituationInfo>>,
    userSubscriptionsOn: Array<Subscription>
): Array<UserSubscriptionNotification> => {
    let userSubscriptionNotifications: Array<UserSubscriptionNotification> = [];

    userSubscriptionsOn
        .filter(subscription => subscription.active !== false)
        .forEach((subscription: Subscription) => {
            if (subscription.type === SubscriptionType.Country) { // TODO: Take into account timezone
                const userSubscriptionCountry = countriesInfoMap.get(subscription.value.toLocaleLowerCase());
                if (!userSubscriptionCountry) {
                    return;
                }

                const subscriptionCountryLastInfo: CountrySituationInfo = userSubscriptionCountry[userSubscriptionCountry.length - 1];

                const subscriptionCountryLastUpdate = subscriptionCountryLastInfo
                    .date
                    .split('-')
                    .map(v => parseInt(v, 10));
                const userSubscriptionCountryLastGivenUpdate = (new Date(subscription.lastUpdate).toISOString().split('T')[0])
                    .split('-')
                    .map(v => parseInt(v, 10));

                if (subscriptionCountryLastUpdate.every((v, idx) => v > userSubscriptionCountryLastGivenUpdate[idx])) {
                    console.log(`${CONSOLE_LOG_DELIMITER}FROM NOTIFICATIONS, INSIED`);
                    console.log(subscription);
                    console.log(subscriptionCountryLastInfo);

                    userSubscriptionNotifications = [
                        ...userSubscriptionNotifications,
                        {
                            subscription,
                            subscriptionMessage: showCountrySubscriptionMessage(
                                subscriptionCountryLastInfo,
                                userSubscriptionCountry[userSubscriptionCountry.length - 2]
                            )
                        },
                    ]
                }
            }
        });

    return userSubscriptionNotifications;
};

export const getUserSubscriptions = async (chatId: number): Promise<UserSubscription> => {
    const allUsersSubscriptions: SubscriptionStorage = await getTelegramSubscriptions();
    return getConcreteUserSubscriptions(chatId, allUsersSubscriptions);
};

