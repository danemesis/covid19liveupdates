import {getCovidTrends} from '../../../services/api/api-chart'
import {CountryLiveInfoModel, CountrySituation} from "../../../models/covid19.models";
import {fetchByCountryLive} from '../../../services/api/alternative-api-covid19'
import {ChartModel, DataSet } from '../../../models/chart.models'
import {Now, addDays} from '../../../utils/dateUtils'
import {Status} from '../../../models/constants'
import { getCountriesSituation } from '../../../services/domain/covid19'
import {ApiCountriesCovid19Situation, ApiCovid19Situation, CountrySituationInfo} from "../../../models/covid19.models";
import {Country} from "../../../models/country.models";

export const showTrendsByCountry = async (bot, message, chatId): Promise<void> =>
    {

        // fetchByCountryAndStatusLive('spain', Status.Confirmed, '', '')
        // .then(data => data.filter((x : CountryLiveInfoModel) => {
        //     const date = new Date(x.Date);
        //     return date < Now && date > addDays(Now, -7);
        // }))
        // .then(data => bot.sendMessage(chatId,
        //     getCovidTrends(Transform(data))
        // ));


        // fetchByCountryLive('spain')
        // //TODO: bring commented code alive
        // // .then((data: Array<[Status, Array<CountryLiveInfoModel>]>) => 
        // //     data
        // //     .map((x: [Status, Array<CountryLiveInfoModel>]) => 
        // //         [x[0], x[1].filter( (y: CountryLiveInfoModel) => true)]))
        // .then((data) => bot.sendMessage(chatId,
        //     getCovidTrends(TransformTuple(data))
        // ));

    const requestedCountry = 'Ukraine';//message.text;

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

    
    console.log("I FOUND THIS STUF", lastWeekSituation);
    bot.sendMessage(chatId,
            getCovidTrends(Transform(lastWeekSituation))
        )

    }


    function Transform(situations:  CountrySituationInfo[]): ChartModel{

        console.log("transform, started");
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


    //Plak plak that code below was could not be used anymore. Plak.. plak..

    function TransformOld(resultSet : Array<CountryLiveInfoModel>): ChartModel{

        const result = resultSet

        console.log("transform, started");
        const days = resultSet.map(x => new Date(x.Date).toLocaleDateString("en-US"));
        const cases = resultSet.map(x => x.Cases);
        return { 
            type: 'line', 
            data: { 
                labels: days, 
                datasets: [
                    { label: 'confirmed', data: cases, 
                        fill: false, 
                        borderColor: 'blue' 
                    }, 
                    { 
                        label: 'Cats', 
                        data: [100, 200, 300, 400, 500], 
                        fill: false, 
                        borderColor: 'green' 
                    }
                ]
            }
        };
    }
    
    function TransformTuple(resultSet : Array<[Status, Array<CountryLiveInfoModel>]>): ChartModel{

        const datasets = resultSet
            .map((setPerStatus: [Status, Array<CountryLiveInfoModel>]): DataSet => {
                return {
                    label: setPerStatus[0],
                    fill: false,
                    data: setPerStatus[1].filter(x => {
                        const date = new Date(x.Date);
                        return date < Now && date > addDays(Now, -7);
                    }).map((x: CountryLiveInfoModel) => x.Cases),
                    borderColor: 'blue'
                };
            });

        //Taking list of days just from first array. It's expected to be the same across all the arrays 
        //TODO: filter once
        const days = resultSet[0][1].filter(x => {
            const date = new Date(x.Date);
            return date < Now && date > addDays(Now, -7);
        }).map((x: CountryLiveInfoModel) => new Date(x.Date).toLocaleDateString("en-US"));

        return { 
            type: 'line', 
            data: { 
                labels: days, 
                datasets: datasets
            }
        };
    }