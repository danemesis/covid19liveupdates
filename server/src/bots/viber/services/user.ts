import { UserService } from '../../../services/domain/user.service';
import { viberStorage } from './storage';
import { StorageService } from '../../../services/domain/storage.service';
import { User } from '../../../models/user.model';

class ViberUserService extends UserService {
    constructor(protected storage: StorageService) {
        super(storage);
    }

    public getUser(user: number | string): Promise<User | null>;
    public getUser(user: User): Promise<User | null>;
    public getUser(user: User | number | string): Promise<User | null> {
        return super.getUser(user);
    }
}

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
