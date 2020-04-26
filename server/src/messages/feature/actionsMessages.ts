import { getLocalizedMessage } from '../../services/domain/localization.service';

export const getCloseActionMessage = (locale: string | null): string =>
    getLocalizedMessage(locale, ['Sure']).join();
