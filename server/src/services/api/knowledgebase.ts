import axios, {AxiosResponse} from 'axios';
import {Answer, ApiAnswer} from "../../models/knowledgebase/answer";
import {environments} from "../../environments/environment";
import {KnowledgebaseMeta} from "../../models/knowledgebase/meta";

export function fetchKnowledgeBaseInfo(): Promise<KnowledgebaseMeta> {
    return axios.get<KnowledgebaseMeta>(`${environments.KNOWLEDGEBASE_URL}/knowledge/meta`)
        .then((response: AxiosResponse): KnowledgebaseMeta => response.data)
}

export function fetchCategories(): Promise<Array<string>> {
    return axios.get<Array<string>>(`${environments.KNOWLEDGEBASE_URL}/categories`)
        .then((response: AxiosResponse): Array<string> => response.data)
};

export function fetchAnswer(question: string): Promise<Array<Answer>> {
    return axios.get<ApiAnswer>(`${environments.KNOWLEDGEBASE_URL}/question`, {params: {question}})
        .then((response: AxiosResponse): Array<ApiAnswer> => response.data)
        .then((answers: Array<ApiAnswer>): Array<Answer> => answers.map(v => ({...v, question})))
}