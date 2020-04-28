import * as getParameterAfterCommandFromMessage from './getParameterAfterCommandFromMessage';
import { withSingleParameterAfterCommand } from './withSingleParameterAfterCommand';
import * as noResponse from '../../botResponse/noResponse';
import { logger } from '../../../../utils/logger';
import { LogCategory } from '../../../../models/constants';

describe('withSingleParameterAfterCommand', () => {
    const errorMock: any = new Error('error');
    const contextMock: any = {
        singleParameterAfterCommands: 'singleParameterAfterCommands',
    };
    let handleFnMock: any;
    const telegramBotMock: any = {};
    const messageMock: any = { text: 'textMock' };
    const chatIdMock: number = 1;
    const userMock: any = {};
    const ikCbDataMock: string = 'ikCbDataMock';

    let getParameterAfterCommandFromMessageMock: any;
    let noResponseMock: any;
    let loggerMock: any;

    beforeEach(() => {
        handleFnMock = jest.fn();

        getParameterAfterCommandFromMessageMock = spyOn(
            getParameterAfterCommandFromMessage,
            'getParameterAfterCommandFromMessage'
        ).and.callFake((singleParameterAfterCommands, userInput) => {
            if (userInput === 'error') {
                throw errorMock;
            }
            return 'result';
        });

        noResponseMock = spyOn(noResponse, 'noResponse');
        loggerMock = spyOn(logger, 'error');
    });

    afterAll(() => {
        getParameterAfterCommandFromMessageMock.mockRestore();
        noResponseMock.mockRestore();
        loggerMock.mockRestore();
    });

    it('should handleFnMock be called', () => {
        withSingleParameterAfterCommand(
            contextMock,
            handleFnMock
        )({
            bot: telegramBotMock,
            message: messageMock,
            user: userMock,
            chatId: chatIdMock,
            commandParameter: ikCbDataMock,
        });

        expect(handleFnMock).toBeCalled();
    });

    it('should getParameterAfterCommandFromMessageMock be called with singleParameterAfterCommands and ikCbDataMock', () => {
        withSingleParameterAfterCommand(
            contextMock,
            handleFnMock
        )({
            bot: telegramBotMock,
            message: messageMock,
            user: userMock,
            chatId: chatIdMock,
            commandParameter: ikCbDataMock,
        });

        expect(getParameterAfterCommandFromMessageMock).toBeCalledTimes(1);
        expect(getParameterAfterCommandFromMessageMock).toHaveBeenCalledWith(
            'singleParameterAfterCommands',
            'ikcbdatamock'
        );
    });

    it('should getParameterAfterCommandFromMessageMock be called with singleParameterAfterCommands and textMock', () => {
        withSingleParameterAfterCommand(
            contextMock,
            handleFnMock
        )({
            bot: telegramBotMock,
            message: messageMock,
            user: userMock,
            chatId: chatIdMock,
        });

        expect(getParameterAfterCommandFromMessageMock).toBeCalledTimes(1);
        expect(getParameterAfterCommandFromMessageMock).toHaveBeenCalledWith(
            'singleParameterAfterCommands',
            'textmock'
        );
    });
});
