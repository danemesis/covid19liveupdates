import * as getParameterAfterCommandFromMessage from './getParameterAfterCommandFromMessage';
import { withSingleParameterAfterCommand } from './withSingleParameterAfterCommand';
import * as noResponse from '../../botResponse/noResponse';
import { logger } from '../../../../utils/logger';
import { LogglyTypes } from '../../../../models/loggly.models';

describe('withSingleParameterAfterCommand', () => {
    const contextMock: any = {
        singleParameterAfterCommands: 'singleParameterAfterCommands',
    };
    let handleFnMock: any;
    const telegramBotMock: any = {};
    const messageMock: any = { text: 'textMock' };
    const chatIdMock: number = 1;
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
                throw new Error('error');
            }
            return 'result';
        });

        noResponseMock = spyOn(noResponse, 'noResponse');

        loggerMock = spyOn(logger, 'log');
    });

    afterAll(() => {
        getParameterAfterCommandFromMessageMock.mockRestore();
        noResponseMock.mockRestore();
        loggerMock.mockRestore();
    });

    it('should handleFnMock be called', () => {
        withSingleParameterAfterCommand(contextMock, handleFnMock)(
            telegramBotMock,
            messageMock,
            chatIdMock,
            ikCbDataMock
        );

        expect(handleFnMock).toBeCalled();
    });

    it('should getParameterAfterCommandFromMessageMock be called with singleParameterAfterCommands and ikCbDataMock', () => {
        withSingleParameterAfterCommand(contextMock, handleFnMock)(
            telegramBotMock,
            messageMock,
            chatIdMock,
            ikCbDataMock
        );

        expect(getParameterAfterCommandFromMessageMock).toBeCalledTimes(1);
        expect(getParameterAfterCommandFromMessageMock).toHaveBeenCalledWith(
            'singleParameterAfterCommands',
            'ikcbdatamock'
        );
    });

    it('should getParameterAfterCommandFromMessageMock be called with singleParameterAfterCommands and textMock', () => {
        withSingleParameterAfterCommand(contextMock, handleFnMock)(
            telegramBotMock,
            messageMock,
            chatIdMock
        );

        expect(getParameterAfterCommandFromMessageMock).toBeCalledTimes(1);
        expect(getParameterAfterCommandFromMessageMock).toHaveBeenCalledWith(
            'singleParameterAfterCommands',
            'textmock'
        );
    });

    it('should handlerFn be called with params', () => {
        withSingleParameterAfterCommand(contextMock, handleFnMock)(
            telegramBotMock,
            messageMock,
            chatIdMock
        );

        expect(handleFnMock).toBeCalledTimes(1);
        expect(handleFnMock).toHaveBeenCalledWith(
            telegramBotMock,
            messageMock,
            chatIdMock,
            'result'
        );
    });

    it('should send no response', () => {
        withSingleParameterAfterCommand(contextMock, handleFnMock)(
            telegramBotMock,
            messageMock,
            chatIdMock,
            'error'
        );

        expect(handleFnMock).not.toBeCalled();
        expect(noResponseMock).toHaveBeenCalledWith(
            telegramBotMock,
            messageMock,
            chatIdMock
        );
    });

    it('should log error', () => {
        withSingleParameterAfterCommand(contextMock, handleFnMock)(
            telegramBotMock,
            messageMock,
            chatIdMock,
            'error'
        );

        expect(handleFnMock).not.toBeCalled();
        expect(loggerMock).toHaveBeenCalledWith('error', {
            ...messageMock,
            type: LogglyTypes.CommandError,
            message: 'error',
        });
    });
});
