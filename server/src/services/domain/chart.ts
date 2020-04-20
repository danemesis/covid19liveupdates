import { ChartModel } from '../../models/chart.models';
import { CountrySituationInfo } from '../../models/covid19.models';
import { Status } from '../../models/constants';
export const Transform = (situations: CountrySituationInfo[]): ChartModel => {
    const days = situations.map((x) => x.date);
    return {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: Status.Confirmed,
                    data: situations.map((x) => x.confirmed),
                    fill: false,
                    borderColor: 'blue',
                },
                {
                    label: Status.Deaths,
                    data: situations.map((x) => x.deaths),
                    fill: false,
                    borderColor: 'red',
                },
                {
                    label: Status.Recovered,
                    data: situations.map((x) => x.recovered),
                    fill: false,
                    borderColor: 'green',
                },
            ],
        },
        options: {},
    };
};

export const enrichWithTitle = (
    model: ChartModel,
    title: string
): ChartModel => {
    return {
        ...model,
        options: {
            ...model.options,
            title: {
                display: true,
                text: title,
                fontColor: 'hotpink',
                fontSize: 32,
            },
        },
    };
};
