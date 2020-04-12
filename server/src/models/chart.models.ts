export type DataSet = {
    label: string,
    data: Array<number>,
    fill: boolean,
    borderColor: string
}

type ChartData = {
    labels: Array<string>
    datasets: Array<DataSet>
}

export type ChartModel = {
    type: string,
    data: ChartData
}

const b = { 
    type: 'line', 
    data: { 
        labels: ['January', 'February', 'March', 'April', 'May'], 
        datasets: [
            { label: 'Dogs', data: [50, 60, 70, 180, 190], 
                fill: false, 
                borderColor: 'blue' 
            }, 
            { 
                label: 'Cats', 
                data: [100, 200, 300, 400, 500], 
                fill: false, 
                borderColor: 'green' 
            }
        ]
    }
};