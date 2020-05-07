import { telegramStorage } from './storage';
import { UserService } from '../../../services/domain/user.service';

export function telegramUserService() {
    let userService;
    return (() => {
        if (!userService) {
            userService = new UserService(telegramStorage());
            return userService;
        }
        return userService;
    })();
}
