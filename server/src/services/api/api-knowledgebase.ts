import axios, {AxiosResponse} from 'axios';
import {Answer, ApiAnswer} from "../../models/knowledgebase/answer.models";
import Config from "../../environments/environment";
import {KnowledgebaseMeta} from "../../models/knowledgebase/meta.models";

export function fetchKnowledgeMetainformation(): Promise<KnowledgebaseMeta> {
    return axios.get<KnowledgebaseMeta>(`${Config.KNOWLEDGEBASE_URL}/meta/all`)
        .then((response: AxiosResponse): KnowledgebaseMeta => response.data)
}

export function fetchAnswer(question: string): Promise<Array<Answer>> {
    return axios.get<ApiAnswer>(`${Config.KNOWLEDGEBASE_URL}/question`, {params: {question}})
        .then((response: AxiosResponse): Array<ApiAnswer> => response.data)
        .then(
            (answers: Array<ApiAnswer>): Array<Answer> => answers.map(({
                                                                           category,
                                                                           countries,
                                                                           answer,
                                                                           links,
                                                                           additional_answers,
                                                                           additional_links
                                                                       }: ApiAnswer): Answer => ({
                category,
                answer,
                question,
                countries: countries.split(';').map(v => v.trim()).filter(v => !!v),
                links: links.replace(/ /g, '').split(';').filter(v => !!v),
                additionalAnswers: additional_answers.split(';').map(v => v.trim()).filter(v => !!v),
                additionalLinks: additional_links.replace(/ /g, '').split(';').filter(v => !!v),
            }))
        )
}