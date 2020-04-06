import axios, {AxiosResponse} from 'axios';
import {Answer, ApiAnswer} from "../../models/knowledgebase/answer.models";
import environments from "../../environments/environment";
import {KnowledgebaseMeta} from "../../models/knowledgebase/meta.models";

export function fetchKnowledgeMetainformation(): Promise<KnowledgebaseMeta> {
    return axios.get<KnowledgebaseMeta>(`${environments.KNOWLEDGEBASE_URL}/meta/all`, {
        headers: {'x-access-tokens': environments.KNOWLEDGEBASE_SECRET_KEY}
    })
        .then((response: AxiosResponse): KnowledgebaseMeta => response.data)
}

export function fetchAnswer(question: string): Promise<Array<Answer>> {
    return axios.get<ApiAnswer>(`${environments.KNOWLEDGEBASE_URL}/question`, {
            headers: {'x-access-tokens': environments.KNOWLEDGEBASE_SECRET_KEY},
            params: {question},
        }
    )
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