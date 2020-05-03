import { TelegramMessageRegistry } from './telegramMessageRegistry';

describe('TelegramMessageRegistry', () => {
    let messageHandlerRegistry: TelegramMessageRegistry;
    const botMock: any = {
        sendMessage: jest.fn().mockReturnValue(Promise.resolve('message')),
        on: jest.fn(),
    };
    beforeAll(() => {
        messageHandlerRegistry = new TelegramMessageRegistry(botMock);
    });

    it('should be created', () => {
        expect(!!messageHandlerRegistry).toBeTruthy();
    });
});
