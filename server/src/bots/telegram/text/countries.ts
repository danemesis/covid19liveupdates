import {getCountriesSituation} from "../../../api/covid19";
import {OverallCountrySituationResponse, ApiSituation} from "../../../models/covid";
import {getChatId} from "../utils/chat";
import {getSimplifiedMessageForCountry} from "../utils/covid19";
import {getCountryNameFormat} from "../utils/country";
import * as lookup from 'country-code-lookup';

// const lookup = require('country-code-lookup');

export const countries = (bot, message) => {
    getCountriesSituation()
        .then((countriesSituation: Array<[string, Array<ApiSituation>]>) => {
            const Al = getCountryNameFormat(countriesSituation[0][0]);
            console.log('lookup', lookup.countries.length, Al);
            console.log('coun', lookup.byCountry(Al));
            return countriesSituation;
        })
        .then((countriesSituation: Array<[string, Array<ApiSituation>]>) => {
            let worldTotalConfirmed = 0;
            let worldTotalRecovered = 0;
            let worldTotalDeaths = 0;

            const countriesResult: Array<OverallCountrySituationResponse> = [];

            countriesSituation
                .forEach(([countryName, situations]: [string, Array<ApiSituation>]) => {

                    let totalConfirmed = 0;
                    let totalRecovered = 0;
                    let totalDeaths = 0;

                    [situations[situations.length - 1]].forEach(({confirmed, deaths, recovered}: ApiSituation) => {
                        totalRecovered += recovered;
                        totalConfirmed += confirmed;
                        totalDeaths += deaths;
                    });

                    worldTotalConfirmed += totalConfirmed;
                    worldTotalRecovered += totalRecovered;
                    worldTotalDeaths += totalDeaths;

                    countriesResult.push({
                        date: situations[situations.length - 1].date,
                        countryName,
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
                        countryName,
                        date,
                        totalConfirmed,
                        totalRecovered,
                        totalDeaths
                    } = countryResult;

                    portionMessage
                        .push(
                            getSimplifiedMessageForCountry(
                                getCountryNameFormat(countryName),
                                totalConfirmed,
                                totalRecovered,
                                totalDeaths,
                                date
                            )
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
