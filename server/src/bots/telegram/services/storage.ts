import { TELEGRAM_PREFIX } from '../models';
import { Storage } from '../../../services/domain/storage';

export const telegramStorage = new Storage(TELEGRAM_PREFIX);
