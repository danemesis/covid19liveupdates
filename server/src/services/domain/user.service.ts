import * as i18n from 'i18n';
import { StorageService } from './storage.service';
import { UserStorage } from '../../models/storage.models';
import { User } from '../../models/user.model';
import { catchAsyncError } from '../../utils/catchError';
import { logger } from '../../utils/logger';
import { LogCategory } from '../../models/constants';

export class UserService {
    private users: UserStorage;

    constructor(private storage: StorageService) {}

    public getUser(chatId: number): Promise<User | null> {
        return Promise.resolve(
            this.users[
                Object.keys(this.users).find(
                    (key) => parseInt(key, 10) === chatId
                )
            ]
        );
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

    public async setUserLocale(
        user: UserService,
        locale: string
    ): Promise<void> {
        // Not empty
    }

    public async getUserLocale(): Promise<void> {
        // Not empty
    }

    public listenUsers(): void {
        this.storage.subscribeOnUsers(
            (users: UserStorage | null, b?: string | null) => {
                this.users = users;
            }
        );
    }
}
