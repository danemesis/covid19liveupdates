import environments from '../../environments/environment';
import * as stringifyObject from 'stringify-object';
import {ChartModel} from '../../models/chart.models'

export function getCovidTrends(inputData: ChartModel): string{

    const praparedInput =  
        stringifyObject(
            inputData, {
                indent: '',
                singleQuotes: false
            }
    );

    return encodeURI(environments.CHARTSAPI_URL + '?c='+ praparedInput);
}
