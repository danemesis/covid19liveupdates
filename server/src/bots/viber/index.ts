import { Express } from 'express';
import * as Viber from 'viber-bot';

export async function runViberBot(
    app: Express,
    appUrl: string,
    viberToken: string
) {
    const bot = new Viber.Bot({
        authToken: viberToken,
        name: 'covid19bot',
        avatar: '../../../../assets/cover_image.jpg',
    });
    app.use('/viber/webhook', bot.middleware());
    bot.setWebhook(`${appUrl}/viber/webhook`);

    bot.on(Viber.Events.MESSAGE_RECEIVED, (message, response) => {
        // console.log('message', message);
        response.send(new Viber.Message.Text('Hi ' + message.text));
    });

    bot.on(Viber.Events.MESSAGE_RECEIVED, (message, response) => {
        // console.log('message', message);
    });
    bot.on(Viber.Events.MESSAGE_SENT, (message, userProfile) => {
        // console.log('message sent', message);
    });
    bot.on(
        Viber.Events.CONVERSATION_STARTED,
        (userProfile, isSubscribed, context, onFinish) => {
            // console.log('message con started', userProfile);
        }
    );
    bot.on(Viber.Events.ERROR, (err) => {
        // console.log('err', err);
    });
    bot.on(Viber.Events.UNSUBSCRIBED, (response) => {
        // console.log('unsubscribed');
    });
    bot.on(Viber.Events.SUBSCRIBED, (response) =>
        response.send(`Thanks for subscribing, ${response.userProfile.name}`)
    );

    bot.onTextMessage(/^hi|hello$/i, (message, response) => {
        // console.log('message', message);
        response.send(
            new Viber.Message.Text(
                `Hi there ${response.userProfile.name}. I am ${bot.name}`
            )
        );
    });
}
