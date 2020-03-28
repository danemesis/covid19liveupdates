import {ApiCovid19Situation, CountrySituationInfo, OverallCountrySituationResponse} from "../../../models/covid19";
import {getChatId} from "../utils/chat";
import {getCountriesSituation} from "../../../services/domain/covid19";
import {getSimplifiedMessageForCountry} from "../../../utils/messages/countryMessage";
import {Country} from "../../../models/country";

export const countriesResponse = (bot, message) => {
    getCountriesSituation()
        .then((countriesSituation: Array<[Country, Array<CountrySituationInfo>]>) => {
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

            const portionSize: number = 40;

            bot.sendMessage(
                getChatId(message),
                `Total confirmed: ${worldTotalConfirmed}, recovered: ${worldTotalRecovered}, death: ${worldTotalDeaths} in ${countriesResult.length} countries.`
            );

            let portionMessage = [];
            countriesResult
                .forEach((countryResult: OverallCountrySituationResponse, idx: number) => {
                    const {
                        country,
                        lastUpdateDate,
                        totalConfirmed,
                        totalRecovered,
                        totalDeaths
                    } = countryResult;

                    portionMessage
                        .push(
                            getSimplifiedMessageForCountry({
                                countryName: country.name,
                                totalConfirmed,
                                totalRecovered,
                                totalDeaths,
                                lastUpdateDate
                            })
                        );

                    if (idx % portionSize === 0 || idx === countriesResult.length - 1) {
                        bot.sendMessage(
                            getChatId(message),
                            portionMessage.join('\n')
                        );

                        portionMessage = [];
                    }
                });
        });
};
