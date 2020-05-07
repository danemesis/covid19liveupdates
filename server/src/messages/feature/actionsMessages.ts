import { getLocalizedMessages } from '../../services/domain/localization.service';

export const getCloseActionMessage = (locale: string | null): string =>
    getLocalizedMessages(locale, 'Sure');
