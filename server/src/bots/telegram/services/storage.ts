import { TELEGRAM_PREFIX } from '../models';
import { StorageService } from '../../../services/domain/storage.service';

export function telegramStorage() {
    let storage;
    return (() => {
        if (!storage) {
            storage = new StorageService(TELEGRAM_PREFIX);
            return storage;
        }
        return storage;
    })();
}
