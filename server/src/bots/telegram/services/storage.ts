import { TELEGRAM_PREFIX } from '../models';
import { StorageService } from '../../../services/domain/storage.service';

export const telegramStorage = new StorageService(TELEGRAM_PREFIX);
