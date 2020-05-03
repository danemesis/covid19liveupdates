import { ViberTextMessage, ViberBot } from '../bots/viber/models';
import * as TelegramBot from 'node-telegram-bot-api';

export type Bot = ViberBot | TelegramBot;
export type Message = ViberTextMessage | TelegramBot.Message;
