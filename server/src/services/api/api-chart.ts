import environments from "../../environments/environment";
const stringifyObject = require('stringify-object');

const c={type:'bar',data:{labels:[2012,2013,2014,2015,2016],datasets:[{label:'Users',data:[120,60,50,180,120]}]}};
const pretty = stringifyObject(c, {
    indent: '',
    singleQuotes: false
});
export function getCovidTrends(){

    return encodeURI(environments.CHARTSAPI_URL + '?c=' + pretty);
}