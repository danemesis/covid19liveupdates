import { getLocalizedMessages } from '../../services/domain/localization.service';

export const trendsErrorMessage = (locale: string | null): string =>
    getLocalizedMessages(
        locale,
        'Sorry, we cannot show statistic. Server is unreachable, try later'
    );
