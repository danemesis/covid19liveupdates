import {ApiCountriesCovid19Situation} from "../../models/covid19.models";
import axios, {AxiosResponse} from 'axios';
import Config from "../../environments/environment";

export function fetchCovid19Data(): Promise<ApiCountriesCovid19Situation> {
    return axios.get(`${Config.COVID19API_URL}/timeseries.json`)
        .then((response: AxiosResponse): ApiCountriesCovid19Situation => response.data)
}