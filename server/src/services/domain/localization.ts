import { Storage } from './storage';
import * as i18n from 'i18n';
import { User } from '../../models/user.model';

export class Localization {
    constructor(private storage: Storage) {}

    public async getAvailableLanguages(): Promise<Array<string>> {
        return i18n.getLocales();
    }

    public async setUserLocale(user: User, locale: string): Promise<void> {
        return this.storage.setUserLocale(user, locale);
    }

    public async getUserLocale(): Promise<void> {
        // Not empty
    }
}
