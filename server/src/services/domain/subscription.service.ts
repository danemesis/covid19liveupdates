import { MessageRegistry } from './registry/messageRegistry';
import { Country } from '../../models/country.models';
import { CountrySituationInfo } from '../../models/covid19.models';
import { StorageService } from './storage.service';
import { catchAsyncError } from '../../utils/catchError';
import { logger } from '../../utils/logger';
import { LogCategory } from '../../models/constants';
import {
    Subscription,
    SubscriptionType,
    UserSubscription,
    UserSubscriptionNotification,
} from '../../models/subscription.models';
import { User } from '../../models/user.model';
import { isCountrySituationHasChangedSinceLastData } from './subscriptions';
import { getCountrySubscriptionMessage } from '../../messages/feature/subscribeMessages';

export const subscriptionNotifierHandler = async (
    messageHandlerRegistry: MessageRegistry,
    storageService: StorageService,
    countriesData: [number, Array<[Country, Array<CountrySituationInfo>]>]
): Promise<void> => {
    const allUsersSubscriptions = await storageService.getSubscriptions();
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
        const user = await storageService.getUser(chatId);
        const [err, result] = await catchAsyncError(
            getAndSendUserNotificationSubscriptions(
                messageHandlerRegistry,
                storageService,
                countriesInfoMap,
                userSubscription,
                user
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
    messageHandlerRegistry: MessageRegistry,
    storageService: StorageService,
    countriesInfoMap: Map<string, Array<CountrySituationInfo>>,
    userSubscription: UserSubscription,
    { settings, chatId }: User
) => {
    const userSubscriptionsUpdate: Array<UserSubscriptionNotification> = getUserActiveSubscriptionNotifications(
        countriesInfoMap,
        userSubscription.subscriptionsOn.filter(
            (sub: Subscription) => sub.active
        ),
        settings?.locale
    );

    if (!!userSubscriptionsUpdate?.length) {
        const [
            sendingNotificationErr,
            sendingNotificationResult,
        ] = await catchAsyncError(
            messageHandlerRegistry.sendUserNotification(
                chatId,
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
            storageService.setSubscription({
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
    userActiveSubscriptions: Array<Subscription>,
    locale: string
): Array<UserSubscriptionNotification> => {
    let userSubscriptionNotifications: Array<UserSubscriptionNotification> = [];

    userActiveSubscriptions.forEach((subscription: Subscription) => {
        if (subscription.type === SubscriptionType.Country) {
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
                    subscriptionMessage: getCountrySubscriptionMessage(
                        subscriptionCountryLastInfo,
                        subscription.lastReceivedData ?? {},
                        locale
                    ),
                },
            ];
        }
    });

    return userSubscriptionNotifications;
};
