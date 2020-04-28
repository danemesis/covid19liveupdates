import { telegramStorage } from './storage';
import { UserService } from '../../../services/domain/user.service';

export const telegramUserService = new UserService(telegramStorage);
