import { UserMessages, UserRegExps } from '../models/constants';

export const isMessageStartsWithCommand = (text: string): boolean =>
    text?.[0] === '/';
export const isMessageIsCommand = (
    text: string,
    command: UserRegExps
): boolean => text.trim() === command;

export const isCommandOnly = (text: string): boolean =>
    text.trim().split(' ').length === 1;

export const isMatchingDashboardItem = (
    text: string,
    dashboardItem: UserMessages
): boolean => text.length === dashboardItem.length;
export const isMatchingDashboardItemStrict = (
    text: string,
    dashboardItem: UserMessages
): boolean => text.length === dashboardItem.length && text === dashboardItem;
