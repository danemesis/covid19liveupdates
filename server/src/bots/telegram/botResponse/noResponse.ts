import {noResponseForUserMessage} from '../../../messages/userMessage';
import {TelegramMessage} from '../models';
import {catchAsyncError} from '../../../utils/catchError';
import {setTelegramQueryToAnalyseSubscription} from '../services/storage';
import {logger} from '../../../utils/logger';
import {getErrorMessage} from '../../../utils/getLoggerMessages';
import {getHelpProposalInlineKeyboard} from '../services/keyboard';

export const noResponse = async (bot, message: TelegramMessage, chatId: number): Promise<void> => {
    const [err, result] = await catchAsyncError(setTelegramQueryToAnalyseSubscription(message));
    if (err) {
        logger.log(
            'error',
            getErrorMessage(err)
        )
    }

    return bot.sendMessage(
        chatId,
        noResponseForUserMessage(message.text),
        getHelpProposalInlineKeyboard()
    );
};
