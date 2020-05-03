import { Express } from 'express';
import { Bot, Events, Message } from 'viber-bot';
import { logger } from '../../utils/logger';
import { LogCategory, LogLevel } from '../../models/constants';
import { Keyboard, ReceivedTextMessage, Response, ViberBot } from './models';

export async function runViberBot(
    app: Express,
    appUrl: string,
    viberToken: string
) {
    const bot: ViberBot = new Bot({
        authToken: viberToken,
        name: 'covid19bot',
        avatar: '../../../../assets/cover_image.jpg',
    });
    // It's equivalent for telegram/index.ts 64 line
    app.use('/viber/webhook', bot.middleware());
    bot.setWebhook(`${appUrl}/viber/webhook`);

    bot.on(Events.MESSAGE_RECEIVED, (message, response) => {
        // console.log('message MESSAGE_RECEIVED', message, response);
        // response.send(new Message.Text('Hi ' + message.text));
    });

    bot.on(Events.MESSAGE_RECEIVED, (message, response) => {
        // console.log('message', message);
    });
    bot.on(Events.MESSAGE_SENT, (message, userProfile) => {
        // console.log('message sent', message);
    });
    bot.on(
        Events.CONVERSATION_STARTED,
        (userProfile, isSubscribed, context, onFinish) => {
            // console.log('message con started', userProfile);
        }
    );
    bot.on(Events.ERROR, (err) => {
        logger.log(LogLevel.Error, err, LogCategory.ViberError);
    });
    bot.on(Events.UNSUBSCRIBED, (response) =>
        response.send(`We are sorry to hear that, ${response.userProfile.name}`)
    );
    bot.on(Events.SUBSCRIBED, (response) =>
        response.send(`Thanks for subscribing, ${response.userProfile.name}`)
    );

    bot.onTextMessage(
        /^hi|hello$/i,
        (message: ReceivedTextMessage, response: Response) => {
            // console.log('message', bot);
            // console.log('response.userProfile', response.userProfile);
            // const [err, res] = await catchAsyncError(bot.getUserDetails(response.userProfile));
            // if (err) {
            //     console.log(err);
            // }
            // console.log('res', res);
            // console.log('res user prof', response.userProfile);
            // response.send(
            //     new Message.Text(
            //         `Hi there ${response.userProfile.name}. I am ${bot.name}`,
            //     ),
            // );

            const SAMPLE_KEYBOARD: Keyboard = {
                Type: 'keyboard',
                Revision: 1,
                Buttons: [
                    {
                        Columns: 3,
                        Rows: 2,
                        BgColor: '#e6f5ff',
                        BgMedia:
                            'http://www.jqueryscript.net/images/Simplest-Responsive-jQuery-Image-Lightbox-Plugin-simple-lightbox.jpg',
                        BgMediaType: 'picture',
                        BgLoop: true,
                        ActionType: 'reply',
                        ActionBody: 'Yes',
                    },
                ],
            };

            const messageKeybard = new Message.Keyboard(SAMPLE_KEYBOARD);
            return bot.sendMessage({ id: response.userProfile.id }, [
                new Message.Text(
                    `Hi there ${response.userProfile.name}. I am ${bot.name}`
                ),
                messageKeybard,
            ]);
        }
    );

    return true;
}
