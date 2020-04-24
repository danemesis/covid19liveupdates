import { Country } from '../../../models/country.models';
import { CountrySituationInfo } from '../../../models/covid19.models';
import {
    Subscription,
    SubscriptionType,
    UserSubscription,
    UserSubscriptionNotification,
} from '../../../models/subscription.models';
import { catchAsyncError } from '../../../utils/catchError';
import { logger } from '../../../utils/logger';
import { isCountrySituationHasChangedSinceLastData } from '../../../services/domain/subscriptions';
import { showCountrySubscriptionMessage } from '../../../messages/feature/subscribeMessages';
import { LogCategory } from '../../../models/constants';
import { MessageHandlerRegistry } from './registry/messageHandlerRegistry';
import { telegramStorage } from './storage';

export const subscriptionNotifierHandler = async (
    messageHandlerRegistry: MessageHandlerRegistry,
    countriesData: [number, Array<[Country, Array<CountrySituationInfo>]>]
): Promise<void> => {
    const allUsersSubscriptions = await telegramStorage.getSubscriptions();
    const [_, countriesInfo] = countriesData;
    const countriesInfoMap: Map<string, Array<CountrySituationInfo>> = new Map(
        countriesInfo.map(([country, countrySituations]) => [
            country.name.toLocaleLowerCase(),
            countrySituations,
        ])
    );

    for (const [chatId, userSubscription] of Object.entries(
        allUsersSubscriptions
    )) {
        const [err, result] = await catchAsyncError(
            getAndSendUserNotificationSubscriptions(
                messageHandlerRegistry,
                countriesInfoMap,
                userSubscription,
                chatId
            )
        );
        if (err) {
            logger.error(
                `General subscriptionNotifierHandler, sending user ${chatId} notification  failed`,
                err,
                LogCategory.SubscriptionNotifierGeneral
            );
        }
    }
};

const getAndSendUserNotificationSubscriptions = async (
    messageHandlerRegistry: MessageHandlerRegistry,
    countriesInfoMap: Map<string, Array<CountrySituationInfo>>,
    userSubscription: UserSubscription,
    chatId: string
) => {
    const userSubscriptionsUpdate: Array<UserSubscriptionNotification> = getUserActiveSubscriptionNotifications(
        countriesInfoMap,
        userSubscription.subscriptionsOn.filter(
            (sub: Subscription) => sub.active
        )
    );

    if (!!userSubscriptionsUpdate?.length) {
        const [
            sendingNotificationErr,
            sendingNotificationResult,
        ] = await catchAsyncError(
            messageHandlerRegistry.sendUserNotification(
                parseInt(chatId, 10),
                userSubscriptionsUpdate
                    .map(
                        (subUp: UserSubscriptionNotification) =>
                            subUp.subscriptionMessage
                    )
                    .join('\n\n')
            )
        );
        if (!!sendingNotificationErr) {
            return logger.error(
                `User ${chatId} notifications has not been send`,
                sendingNotificationErr,
                LogCategory.SubscriptionNotifier
            );
        }

        const mergeAllUserSubscriptions: Array<Subscription> = (userSubscription as UserSubscription).subscriptionsOn.map(
            (sub: Subscription) => {
                const updateUserSub = userSubscriptionsUpdate.find(
                    ({
                        subscription: { value, type, active },
                    }: UserSubscriptionNotification) =>
                        active === sub.active &&
                        type === sub.type &&
                        value === sub.value
                );
                if (updateUserSub) {
                    return updateUserSub.subscription;
                }

                return sub;
            }
        );

        const [
            updatingUserSubscriptionErr,
            updatingUserSubscriptionResult,
        ] = await catchAsyncError(
            telegramStorage.setSubscription({
                chat: userSubscription.chat,
                subscriptionsOn: mergeAllUserSubscriptions,
            })
        );
        if (!!updatingUserSubscriptionErr) {
            return logger.error(
                `User ${chatId} notifications has not been updated. Thus, system will wrongly send more updates even that it's already sent such messages to a user`,
                updatingUserSubscriptionErr,
                LogCategory.SubscriptionNotifier
            );
        }
    }
};

const getUserActiveSubscriptionNotifications = (
    countriesInfoMap: Map<string, Array<CountrySituationInfo>>,
    userActiveSubscriptions: Array<Subscription>
): Array<UserSubscriptionNotification> => {
    let userSubscriptionNotifications: Array<UserSubscriptionNotification> = [];

    userActiveSubscriptions.forEach((subscription: Subscription) => {
        if (subscription.type === SubscriptionType.Country) {
            // TODO: Take into account timezone
            const userSubscriptionCountry = countriesInfoMap.get(
                subscription.value.toLocaleLowerCase()
            );
            if (!userSubscriptionCountry) {
                return;
            }

            const subscriptionCountryLastInfo: CountrySituationInfo =
                userSubscriptionCountry[userSubscriptionCountry.length - 1];
            if (
                subscription.lastReceivedData &&
                !isCountrySituationHasChangedSinceLastData(
                    subscriptionCountryLastInfo,
                    subscription.lastReceivedData
                )
            ) {
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
                    ),
                },
            ];
        }
    });

    return userSubscriptionNotifications;
};
