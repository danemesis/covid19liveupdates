import { UserService } from '../../../services/domain/user.service';
import { viberStorage } from './storage';

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
