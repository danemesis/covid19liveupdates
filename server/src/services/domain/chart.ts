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
                    backgroundColor: '#f3a16c',
                },
                {
                    label: Status.Deaths,
                    data: situations.map((x) => x.deaths),
                    fill: false,
                    borderColor: '#de425b',
                    backgroundColor: '#de425b',
                },
                {
                    label: Status.Recovered,
                    data: situations.map((x) => x.recovered),
                    fill: false,
                    borderColor: '#488f31',
                    backgroundColor: '#488f31',
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

export const enrichWithType = (model: ChartModel, type: string): ChartModel => {
    if (type === 'barStacked') {
        return {
            ...model,
            type: 'bar',
            options: {
                ...model.options,
                scales: {
                    xAxes: [
                        {
                            stacked: true,
                        },
                    ],
                    yAxes: [
                        {
                            stacked: true,
                        },
                    ],
                },
            },
        };
    }
    return {
        ...model,
        type,
    };
};
