import { ChartModel } from '../../models/chart.models';
import { CountrySituationInfo } from '../../models/covid19.models';
import { Status } from '../../models/constants';

export const Transform = (
    situations: CountrySituationInfo[],
    statuses: any
): ChartModel => {
    const days = situations.map((x) => x.date);
    return {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: statuses[Status.Confirmed],
                    data: situations.map((x) => x.confirmed),
                    fill: false,
                    borderColor: 'rgb(230, 165, 96)',
                    backgroundColor: 'rgb(230, 165, 96)',
                },
                {
                    label: statuses[Status.Deaths],
                    data: situations.map((x) => x.deaths),
                    fill: false,
                    borderColor: 'rgb(222, 66, 91)',
                    backgroundColor: 'rgb(222, 66, 91)',
                },
                {
                    label: statuses[Status.Recovered],
                    data: situations.map((x) => x.recovered),
                    fill: false,
                    borderColor: 'rgb(62, 148, 107)',
                    backgroundColor: 'rgb(62, 148, 107)',
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
                fontColor: 'dark',
                fontFamily: 'Helvetica',
                fontSize: 28,
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
