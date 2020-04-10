import {getCovidTrends} from '../../../services/api/api-chart'

export const showTrendsByCountry = async (bot, message, chatId): Promise<void> =>
    {
        console.log("ask for trends");
        console.log(bot.sendPhoto);
        getCovidTrends()

        bot.sendMessage(chatId,
            getCovidTrends()
        );

        // .then(tr => bot.sendPhoto({
        //     chat_id : chatId,
        //     caption: 'This is my test image',
        //     photo: tr//replace your image url here
        // }))
        // .then(tr => console.log(tr))
        // .then(td => console.log(' trends recieved'));
    }