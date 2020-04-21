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

    it('should send noResponse', () => {
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
        const ikCbDataErrorCauseMock = 'error';

        withSingleParameterAfterCommand(contextMock, handleFnMock)(
            telegramBotMock,
            messageMock,
            chatIdMock,
            ikCbDataErrorCauseMock
        );

        expect(handleFnMock).not.toBeCalled();
        expect(loggerMock).toHaveBeenCalledWith(
            `Error happend inside withSingleParameterAfterCommand() for ${chatIdMock} with message: ${messageMock.text} and ikCbData: ${ikCbDataErrorCauseMock}`,
            errorMock,
            LogCategory.Command,
            chatIdMock
        );
    });
});
