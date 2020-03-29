import axios, {AxiosResponse} from 'axios';
import {Answer, ApiAnswer} from "../../models/answer";

export function fetchAnswer(question: string): Promise<Array<Answer>> {
    // TODO: Refactor
    return axios.get<ApiAnswer>("http://localhost:5000/api/v1/question", {params: {question}})
        .then((response: AxiosResponse): Array<ApiAnswer> => response.data)
        .then((answers: Array<ApiAnswer>): Array<Answer> => answers.map(v => ({...v, question})))
}