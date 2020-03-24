const unirest = require("unirest");


export function getData(): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const req = unirest("GET", "https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats");

        req.query({
            "country": "Canada"
        });

        req.headers({
            "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
            "x-rapidapi-key": "f935b06f2bmsh9f32dd67a4382f7p1eafb9jsnaceb43c77417"
        });


        req.end(function (res) {
            res
                .forEach((a) => {
                    console.log('Result case', a, a.confirmed, a.deaths, a.recovered);
                });

            console.log(res);
            if (res.error) {
                reject(new Error(res.error));
            }

            console.log(res.body);
            return resolve(res.body);
        });
    })
}