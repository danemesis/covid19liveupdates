import * as i18n from 'i18n';
import { StorageService } from './storage.service';
import { UserStorage } from '../../models/storage.models';
import { User } from '../../models/user.model';
import { catchAsyncError } from '../../utils/catchError';
import { logger } from '../../utils/logger';
import { LogCategory } from '../../models/constants';

export class UserService {
    private users: UserStorage;

    constructor(private storage: StorageService) {
        // In order to listen User's from the very beginning
        // and have them "in memory"
        this.listenUsers();
    }

    public getUserRequest(user: number | string): Promise<User | null>;
    public getUserRequest(user: User): Promise<User | null>;
    public getUserRequest(user: User | number | string): Promise<User | null> {
        if (typeof user === 'string' || typeof user === 'number') {
            return this.storage.getUser(user);
        }

        return this.storage.getUser(user.chatId);
    }

    public getUser(user: number | string): Promise<User | null>;
    public getUser(user: User): Promise<User | null>;
    public getUser(user: User | number | string): Promise<User | null> {
        return Promise.resolve(
            !this.users
                ? null
                : this.users[
                      Object.keys(this.users).find((key) => {
                          if (typeof user === 'number') {
                              return parseInt(key, 10) === user;
                          }

                          if (typeof user === 'string') {
                              return key === user;
                          }

                          return this.users[key]?.chatId === user?.chatId;
                      })
                  ]
        );
    }

    public async setUserLocale(user: User, locale: string): Promise<void> {
        return this.storage.addUser({
            ...user,
            settings: {
                ...user.settings,
                locale,
            },
        });
    }

    public async setUserInterruptedCommand(
        user: User,
        interruptedCommand: string
    ): Promise<void> {
        return this.storage.addUser({
            ...user,
            state: {
                ...user.state,
                interruptedCommand,
            },
        });
    }

    public async addUser(user: User): Promise<User | null> {
        const [err, result] = await catchAsyncError(this.storage.addUser(user));

        if (err) {
            logger.error(
                `An error occurred while trying to add new user ${user.chatId}`,
                err,
                LogCategory.Command,
                user.chatId
            );
            return null;
        } else {
            logger.log(
                'info',
                `New user ${user.chatId} was successfully added`,
                LogCategory.Command,
                user.chatId
            );
            return user;
        }
    }

    public async getAvailableLanguages(): Promise<Array<string>> {
        return i18n.getLocales();
    }

    public listenUsers(): void {
        this.storage.subscribeOnUsers(
            (users: UserStorage | null, b?: string | null) => {
                this.users = users;
            }
        );
    }
}
