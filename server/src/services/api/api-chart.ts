import environments from '../../environments/environment';
import { ChartModel } from '../../models/chart.models';

export function getCovidTrends(inputData: ChartModel): string {
    const preparedInput = JSON.stringify({
        ...inputData,
        indent: '',
        singleQuotes: false,
    });

    return encodeURI(environments.CHARTSAPI_URL + '?c=' + preparedInput);
}
