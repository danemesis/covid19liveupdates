import { Country } from '../../models/country.models';
import { getCountriesByContinent } from '../../services/domain/countries';
import { getLocalizedMessages } from '../../services/domain/localization.service';

export const getShowCountriesMessage = (
    locale: string | null,
    countries: Array<Country>
): string => {
    const availableFor: string =
        `${getLocalizedMessages(locale, 'Available for')}` +
        ` ${countries.length} ${getLocalizedMessages(
            locale,
            'countries around the'
        )} 🌍`;
    const countriesList: string = Object.entries(
        getCountriesByContinent(countries)
    )
        .map(
            ([continentName, countries]: [string, Array<Country>]): string =>
                `\n🗺️ ${continentName}, ${getLocalizedMessages(
                    locale,
                    'totally'
                )}` +
                ` ${countries.length} ${getLocalizedMessages(
                    locale,
                    'countries'
                )}\n`.concat(
                    countries.map((country: Country) => country.name).join('; ')
                )
        )
        .join('\n');
    const hint: string = `ℹ ${getLocalizedMessages(locale, 'i.e.')} /country ${
        countries[0].name
    }`;

    return availableFor.concat(`\n\n${countriesList}`).concat(`\n\n${hint}`);
};
