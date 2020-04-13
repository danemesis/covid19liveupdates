import environments from '../../environments/environment';
const stringifyObject = require('stringify-object');
import {ChartModel} from '../../models/chart.models'

export function getCovidTrends(inputData: ChartModel) {

    const praparedInput =  
        stringifyObject(
            inputData, {
                indent: '',
                singleQuotes: false
            }
    );

    return encodeURI(environments.CHARTSAPI_URL + '?c='+ praparedInput);
}
