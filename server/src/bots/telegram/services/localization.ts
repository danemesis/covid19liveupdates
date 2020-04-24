import { Localization } from '../../../services/domain/localization';
import { TELEGRAM_PREFIX } from '../models';
import { telegramStorage } from './storage';

export const telegramLocalization = new Localization(telegramStorage);
