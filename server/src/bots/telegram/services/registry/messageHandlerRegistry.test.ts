import { MessageHandlerRegistry } from './messageHandlerRegistry';

describe('MessageHandlerRegistry', () => {
    let messageHandlerRegistry: MessageHandlerRegistry;
    const botMock: any = {
        sendMessage: jest.fn().mockReturnValue(Promise.resolve('message')),
        on: jest.fn(),
    };
    beforeAll(() => {
        messageHandlerRegistry = new MessageHandlerRegistry(botMock);
    });

    it('should be created', () => {
        expect(!!messageHandlerRegistry).toBeTruthy();
    });
});
