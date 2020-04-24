export type DataSet = {
    label: string;
    data: Array<number>;
    fill: boolean;
    backgroundColor?: string;
    borderColor?: string;
};

type ChartData = {
    labels: Array<string>;
    datasets: Array<DataSet>;
};

export type ChartModel = {
    type: string;
    data: ChartData;
    options: any;
};
