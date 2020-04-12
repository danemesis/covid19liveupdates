import environments from "../../environments/environment";
const stringifyObject = require('stringify-object');
import {ChartModel} from '../../models/chart.models'

export function getCovidTrends(inputData: ChartModel) {

    console.log("Creating URL from ", inputData);
    const praparedInput =  
        stringifyObject(
            inputData, {
                indent: '',
                singleQuotes: false
            }
    );

    console.log("FINAL URL", encodeURI(environments.CHARTSAPI_URL + '?c='+ praparedInput));
    return encodeURI(environments.CHARTSAPI_URL + '?c='+ praparedInput);
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