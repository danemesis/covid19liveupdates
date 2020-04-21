import { TELEGRAM_PREFIX } from '../models';
import { Storage } from '../../../services/domain/storage';

export const TelegramStorage = new Storage(TELEGRAM_PREFIX);
export default TelegramStorage;
