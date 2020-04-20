import * as getInfoMessage from '../../../../utils/getErrorMessages';
import { getParameterAfterCommandFromMessage } from './getParameterAfterCommandFromMessage';
import { logger } from '../../../../utils/logger';

const singleParameterAfterCommandMock = [
    '/start',
    '/countries',
    'countries data 🌍',
    '/available',
    'countries we track',
    '/country',
    '/advice',
    'advice how not to 😷',
    '/help',
    'ℹ what can you do?',
    '/assistant',
    'assistant 👦',
    'subscriptions 💌',
    'existing',
    '/subscribe',
    'subscribe me on',
    'unsubscribe me from',
    '/unsubscribe',
    'unsubscribe',
    '/trends',
    'asia',
    'europe',
    'africa',
    'americas',
    'oceania',
    '[~🇦🇫><🇦🇱><🇩🇿><🇦🇩><🇦🇴><🇦🇬><🇦🇷><🇦🇲><🇦🇺><🇦🇹><🇦🇿><🇧🇸><🇧🇭><🇧🇩><🇧🇧><🇧🇾><🇧🇪><🇧🇯><🇧🇹><🇧🇴><🇧🇦><🇧🇷><🇧🇳><🇧🇬><🇧🇫><🇨🇻><🇰🇭><🇨🇲><🇨🇦><🇨🇫><🇹🇩><🇨🇱><🇨🇳><🇨🇴><🇨🇷><🇨🇮><🇭🇷><🇨🇺><🇨🇾><🇨🇿><🇩🇰><🇩🇯><🇩🇴><🇪🇨><🇪🇬><🇸🇻><🇬🇶><🇪🇷><🇪🇪><🇪🇹><🇫🇯><🇫🇮><🇫🇷><🇬🇦><🇬🇲><🇬🇪><🇩🇪><🇬🇭><🇬🇷><🇬🇹><🇬🇳><🇬🇾><🇭🇹><🇻🇦><🇭🇳><🇭🇺><🇮🇸><🇮🇳><🇮🇩><🇮🇷><🇮🇶><🇮🇪><🇮🇱><🇮🇹><🇯🇲><🇯🇵><🇯🇴><🇰🇿><🇰🇪><🇰🇵><🇰🇼><🇰🇬><🇱🇻><🇱🇧><🇱🇷><🇱🇮><🇱🇹><🇱🇺><🇲🇬><🇲🇾><🇲🇻><🇲🇹><🇲🇷><🇲🇺><🇲🇽><🇲🇩><🇲🇨><🇲🇳><🇲🇪><🇲🇦><🇳🇦><🇳🇵><🇳🇱><🇳🇿><🇳🇮><🇳🇪><🇳🇬><🇳🇴><🇴🇲><🇵🇰><🇵🇦><🇵🇬><🇵🇾><🇵🇪><🇵🇭><🇵🇱><🇵🇹><🇶🇦><🇷🇴><🇷🇺><🇷🇼><🇱🇨><🇻🇨><🇸🇲><🇸🇦><🇸🇳><🇷🇸><🇸🇨><🇸🇬><🇸🇰><🇸🇮><🇸🇴><🇿🇦><🇪🇸><🇱🇰><🇸🇩><🇸🇷><🇸🇪><🇨🇭><🇹🇼><🇹🇿><🇹🇭><🇹🇬><🇹🇹><🇹🇳><🇹🇷><🇺🇬><🇺🇦><🇦🇪><🇬🇧><🇺🇾><🇺🇸><🇺🇿><🇻🇪><🇻🇳><🇿🇲><🇿🇼><🇩🇲><🇬🇩><🇲🇿><🇸🇾><🇹🇱><🇧🇿><🇱🇾><🇬🇼><🇲🇱><🇰🇳><🇽🇰><🇲🇲><🇧🇼><🇧🇮><🇸🇱><🇲🇼><🇸🇩><🇪🇭><🇸🇹><🇾🇪~]',
];

describe('getParameterAfterCommandFromMessage', () => {
    let getInfoMessageMock: any;
    let loggerMock: any;

    beforeEach(() => {
        loggerMock = spyOn(logger, 'log');
        getInfoMessageMock = spyOn(
            getInfoMessage,
            'getInfoMessage'
        ).and.returnValue('getInfoMessageResult');
    });

    afterAll(() => {
        loggerMock.mockRestore();
        getInfoMessageMock.mockRestore();
    });

    it('should log warn return undefined if unsupported command', () => {
        const expectation = getParameterAfterCommandFromMessage(
            singleParameterAfterCommandMock,
            '/CommandDoesnotExist'
        );

        expect(loggerMock).toHaveBeenCalledWith('warn', 'getInfoMessageResult');
        expect(getInfoMessageMock).toHaveBeenCalledWith(
            'Entered unsupported command'
        );

        expect(expectation).toBeUndefined();
    });

    it('should log warn return undefined if no arguments', () => {
        const expectation = getParameterAfterCommandFromMessage(
            singleParameterAfterCommandMock,
            '/country'
        );

        expect(loggerMock).toHaveBeenCalledWith('info', 'getInfoMessageResult');
        expect(getInfoMessageMock).toHaveBeenCalledWith(
            'No parameter for /country'
        );

        expect(expectation).toBeUndefined();
    });

    it('should log warn return undefined if no arguments', () => {
        const expectation = getParameterAfterCommandFromMessage(
            singleParameterAfterCommandMock,
            '/country Ukraine'
        );

        expect(loggerMock).not.toBeCalled();
        expect(getInfoMessageMock).not.toBeCalled();

        expect(expectation).toBe('Ukraine');
    });
});
