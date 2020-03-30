import {ApiCovid19Situation, CountrySituationInfo, OverallCountrySituationResponse} from "../../../models/covid19";
import {getChatId} from "../utils/chat";
import {getCountriesSituation} from "../../../services/domain/covid19";
import {getTableRowMessageForCountry, getTableHeader} from "../../../utils/messages/countryMessage";
import {Country} from "../../../models/country";
import {table, tableConfig} from '../../../models/table';

export const countriesResponse = (bot, message) => {
    getCountriesSituation()
        .then(async (countriesSituation: Array<[Country, Array<CountrySituationInfo>]>) => {
            let worldTotalConfirmed = 0;
            let worldTotalRecovered = 0;
            let worldTotalDeaths = 0;

            const countriesResult: Array<OverallCountrySituationResponse> = [];

            countriesSituation
                .forEach(([country, situations]: [Country, Array<CountrySituationInfo>]) => {

                    let totalConfirmed = 0;
                    let totalRecovered = 0;
                    let totalDeaths = 0;

                    [situations[situations.length - 1]].forEach(({confirmed, deaths, recovered}: ApiCovid19Situation) => {
                        totalRecovered += recovered;
                        totalConfirmed += confirmed;
                        totalDeaths += deaths;
                    });

                    worldTotalConfirmed += totalConfirmed;
                    worldTotalRecovered += totalRecovered;
                    worldTotalDeaths += totalDeaths;

                    countriesResult.push({
                        lastUpdateDate: situations[situations.length - 1].date,
                        country,
                        totalConfirmed,
                        totalDeaths,
                        totalRecovered
                    });
                });

            await bot.sendMessage(
                getChatId(message),
                `Total confirmed: ${worldTotalConfirmed}, recovered: ${worldTotalRecovered}, death: ${worldTotalDeaths} in ${countriesResult.length} countries.`
            );

            const portionSize: number = 30;
            let portionStart: number = 0;
            let portionEnd = portionSize;
            let portionMessage = [];
            
            while(portionStart <= countriesResult.length) {
                portionMessage = [];
                portionMessage.push(["","","",""]);
                portionMessage.push(getTableHeader());
                countriesResult
                    .slice(portionStart, portionEnd)
                    .forEach((countryResult: OverallCountrySituationResponse) => {
                        const {
                            country,
                            lastUpdateDate,
                            totalConfirmed,
                            totalRecovered,
                            totalDeaths
                        } = countryResult;
                        portionMessage
                            .push(
                                getTableRowMessageForCountry({
                                    countryName: country.name,
                                    totalConfirmed,
                                    totalRecovered,
                                    totalDeaths,
                                    lastUpdateDate
                                })
                            );

                    });

                await bot.sendMessage(
                    getChatId(message),
                    `<pre>
                    ${table(portionMessage, tableConfig)}
                    </pre>`
                    ,
                    { parse_mode: "HTML" }
                );
                
                portionStart = portionEnd;
                portionEnd += portionSize;
            }

        });
};
