import {getCovidTrends} from '../../../services/api/api-chart'
import {ChartModel} from '../../../models/chart.models'
import {Now, addDays} from '../../../utils/dateUtils'
import {Status} from '../../../models/constants'
import {CountrySituationInfo} from '../../../models/covid19.models';
import {Country} from '../../../models/country.models';
import {getCountriesSituation} from '../../../services/domain/covid19';

export const showTrendsByCountry = async (bot, message, chatId, requestedCountry): Promise<void> =>
{
    const allCountries: Array<[Country, Array<CountrySituationInfo>]> = await getCountriesSituation();
    const foundCountrySituations: [Country, Array<CountrySituationInfo>] = allCountries
        .find(([receivedCountry, situations]) => receivedCountry.name === requestedCountry);
    if (!foundCountrySituations || !foundCountrySituations?.length
        || !foundCountrySituations[0]
        || !foundCountrySituations[1].length) {
        bot.sendMessage(
            chatId,
            `Sorry, but I cannot find anything for ${requestedCountry}. I will save your request and will work on it`
        );
        return;
    }

    const [foundCountry, foundSituation] = foundCountrySituations;

    const lastWeekSituation = foundSituation.filter((c: CountrySituationInfo) => {
        const date = new Date(c.date);
        return date < Now && date > addDays(Now, -7);
    });

    bot.sendMessage(chatId, getCovidTrends(Transform(lastWeekSituation)));

    }

    function Transform(situations:  CountrySituationInfo[]): ChartModel{
        const days = situations.map(x => x.date);
        return { 
            type: 'line', 
            data: { 
                labels: days, 
                datasets: [
                    { label: Status.Confirmed, data: situations.map(x => x.confirmed), 
                        fill: false, 
                        borderColor: 'blue' 
                    }, 
                    { 
                        label: Status.Deaths, 
                        data: situations.map(x => x.deaths), 
                        fill: false, 
                        borderColor: 'red' 
                    },
                    { 
                        label: Status.Recovered, 
                        data: situations.map(x => x.recovered), 
                        fill: false, 
                        borderColor: 'green' 
                    }
                ]
            }
        };
    }