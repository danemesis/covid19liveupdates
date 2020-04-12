import {Modify} from '../tsTypes.models';

export interface ApiAnswer {
    category: string;
    countries: string;
    answer: string;
    links: string;
    additional_answers: string;
    additional_links: string;
}

export type Answer = Omit<Modify<ApiAnswer, {
    question: string;
    countries: Array<string>;
    links: Array<string>;
    additionalAnswers: Array<string>;
    additionalLinks: Array<string>;
}>, 'additional_answers' | 'additional_links'>
