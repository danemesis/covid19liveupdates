import { getLocalizedMessages } from '../../services/domain/localization.service';
import { Emojii } from '../../models/constants';

export const encouragingMessage = (locale: string): string =>
    getLocalizedMessages(locale, [
        '\n\n',
        '<a href="https://www.youtube.com/watch?v=d914EnpU4Fo&feature=youtu.be">',
        'Wash',
        ' 🧼 ',
        'your hands',
        '</a> 👏 ',
        'and stay healthy! Everything will be OK',
    ]).join('');

export const suggestedBehaviors = (locale: string): string =>
    getLocalizedMessages(locale, [
        '\n🚫🤦',
        'Do not touch your face',
        '\n🚫🤧🤲',
        'Don\'t sneeze on your hands',
        '\n✅🤧💪',
        'Do sneeze into your elbow',
        '\n🧼🖐⏲ 20',
        'Wash your hands regularly for at least 20 seconds',
        '\n✅📦😌',
        'Avoid going to groceries without any urgent need; use delivery services as much as you can',
        '\n🚫🛒😡',
        'Purchase consciously. Don\'t grab stuff compulsively from the shelves. Leave enough for others',
        '💕',
    ]).join(' ');

export const socialDistancing = (locale: string): string =>
    getLocalizedMessages(locale, [
        '\n🚫🤝',
        'No handshakes',
        '\n🚫🧑‍🤝‍🧑',
        'No close contact',
        '\n🚫🏟',
        'No large gatherings',
    ]).join(' ');

export const alternativeGreetings = (locale: string): string =>
    getLocalizedMessages(locale, [
        '\n👋',
        'Waving Hand – Hello',
        '\n🖖',
        'Vulcan Salute – Live long and prosper',
        '\n✌️',
        'Victory Hand – Peace',
        '\n🤟',
        'Love-You Gesture – I love you in American Sign Language',
        '\n🤘',
        'Sign of the Horns – Rock on',
        '\n💪',
        'Flexed Biceps – Elbow-touch',
        '\n🙏',
        'Folded Hands – Namaste',
        '\n✋💨🤚 –',
        'Air High Five',
    ]).join(' ');

export const getCovid19ExplanationVideo = (): string => {
    return '<a href="https://www.youtube.com/watch?v=BtN-goy9VOY">COVID-19</a>';
};

export const getAdviceWithVideoMessage = (locale: string | null): string =>
    getLocalizedMessages(locale, [
        `${Emojii.Info}`,
        'Suggested Behaviors for',
        getCovid19ExplanationVideo(),
    ])
        .join(' ')
        .concat(suggestedBehaviors(locale))
        .concat(
            getLocalizedMessages(locale, [
                `\n\n${Emojii.Info}`,
                'Social Distancing',
            ]).join(' ')
        )
        .concat(socialDistancing(locale))
        .concat(
            getLocalizedMessages(locale, [
                `\n\n${Emojii.Info}`,
                'Alternative Greetings',
            ]).join(' ')
        )
        .concat(alternativeGreetings(locale))
        .concat(encouragingMessage(locale));
