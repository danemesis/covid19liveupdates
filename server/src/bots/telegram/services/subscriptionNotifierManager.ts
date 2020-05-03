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
import { getCountrySubscriptionMessage } from '../../../messages/feature/subscribeMessages';
import { LogCategory } from '../../../models/constants';
import { TelegramMessageRegistry } from './registry/telegramMessageRegistry';
import { telegramStorage } from './storage';
import { telegramUserService } from '../services/user';

export const subscriptionNotifierHandler = async (
    messageHandlerRegistry: TelegramMessageRegistry,
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
        const user = await telegramUserService.getUser(parseInt(chatId, 10));
        const [err, result] = await catchAsyncError(
            getAndSendUserNotificationSubscriptions(
                messageHandlerRegistry,
                countriesInfoMap,
                userSubscription,
                chatId,
                user?.settings?.locale
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
    messageHandlerRegistry: TelegramMessageRegistry,
    countriesInfoMap: Map<string, Array<CountrySituationInfo>>,
    userSubscription: UserSubscription,
    chatId: string,
    locale: string
) => {
    const userSubscriptionsUpdate: Array<UserSubscriptionNotification> = getUserActiveSubscriptionNotifications(
        countriesInfoMap,
        userSubscription.subscriptionsOn.filter(
            (sub: Subscription) => sub.active
        ),
        locale
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
    userActiveSubscriptions: Array<Subscription>,
    locale: string
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
