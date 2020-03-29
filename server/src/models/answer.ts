export interface ApiAnswer {
    category: string;
    countries: Array<string>;
    answer: string;
    links: Array<string>;
    additionalAnswers: Array<string>;
    additionalLinks: Array<string>;
}

export interface Answer extends ApiAnswer {
    question: string;
}