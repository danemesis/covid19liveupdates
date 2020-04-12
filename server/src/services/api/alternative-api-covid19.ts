import {CountryLiveInfoModel} from "../../models/covid19.models";
import axios, {AxiosResponse} from 'axios';
import environments from "../../environments/environment";
import {Status} from '../../models/constants'
import { ConfigSet } from "ts-jest/dist/config/config-set";


export function fetchByCountryAndStatusLive(country: string, status: Status, startDate, endDate): Promise<Array<CountryLiveInfoModel>> {
    //@startDate, @endDate params are not smth that is working on API side right now. Later if fixed could be used this way
    // ?from=2020-04-05T00:00:00Z&to=2020-04-11T00:00:00Z

    const url = `${environments.ALTERNATIVECOVID19API_URL}/country/${country}/status/${status}/live`;
    console.log("URL", url);
    return axios.get(url)
        .then((response: AxiosResponse): any => {console.log("REsponse from alternative  api"); return response.data;})
        .catch((error) => {
            console.log("Shit Happend");
            console.log(error);
    });
}

export function fetchByCountryLive(country: string): Promise<Array<[Status, Array<CountryLiveInfoModel>]>>
{
    let ConfirmedCases = [];
    let DeathCases = [];
    return fetchByCountryAndStatusLive(country, Status.Confirmed, '', '')
        .then((data: Array<CountryLiveInfoModel>):any => {
            ConfirmedCases = data;
            return fetchByCountryAndStatusLive(country, Status.Deaths, '', '');
        })
        .then((data: Array<CountryLiveInfoModel>):any => {
            DeathCases = data;
            return fetchByCountryAndStatusLive(country, Status.Recovered, '', '');
        })
        .then((data: Array<CountryLiveInfoModel>):any => [ [Status.Recovered, data], [Status.Deaths, DeathCases], [Status.Confirmed, ConfirmedCases]])
}