import { UserService } from '../../../services/domain/user.service';
import { viberStorage } from './storage';
import { StorageService } from '../../../services/domain/storage.service';
import { User } from '../../../models/user.model';

export function viberUserService() {
    let userService;
    return (() => {
        if (!userService) {
            userService = new UserService(viberStorage());
            return userService;
        }
        return userService;
    })();
}
