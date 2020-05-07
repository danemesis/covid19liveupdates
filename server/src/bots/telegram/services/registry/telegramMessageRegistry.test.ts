import { TelegramMessageRegistry } from './telegramMessageRegistry';

describe('TelegramMessageRegistry', () => {
    let messageHandlerRegistry: TelegramMessageRegistry;
    const botMock: any = {
        sendMessage: jest.fn().mockReturnValue(Promise.resolve('message')),
        on: jest.fn(),
    };
    const userServiceMock: any = {};
    beforeAll(() => {
        messageHandlerRegistry = new TelegramMessageRegistry(
            botMock,
            userServiceMock
        );
    });

    it('should be created', () => {
        expect(!!messageHandlerRegistry).toBeTruthy();
    });
});
