import { Status } from '../../models/constants';
import { ChartModel } from '../../models/chart.models';
import { CountrySituationInfo } from '../../models/covid19.models';

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
    };
};
