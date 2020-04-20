import {getTelegramUser, addTelegramUser} from '../../../src/bots/telegram/services/storage'
import { User } from '../../models/user.model';

export const getUser = async (chatId: number): Promise<User> => (await getTelegramUser(chatId) ?? {});
export const addUser = async (user: User): Promise<void> => (await addTelegramUser(user) ?? {});
