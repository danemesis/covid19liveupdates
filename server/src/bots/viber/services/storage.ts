import { StorageService } from '../../../services/domain/storage.service';
import { VIBER_PREFIX } from '../models';

export function viberStorage() {
    let storage;
    return (() => {
        if (!storage) {
            storage = new StorageService(VIBER_PREFIX);
            return storage;
        }
        return storage;
    })();
}
