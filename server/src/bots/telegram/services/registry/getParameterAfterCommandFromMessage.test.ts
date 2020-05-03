import { getParameterAfterCommandFromMessage } from '../../../../services/domain/registry/getParameterAfterCommandFromMessage';
import {
    Continents,
    CustomSubscriptions,
    UserMessages,
    UserRegExps,
} from '../../../../models/constants';

const singleParameterAfterCommandMock = [
    ...Object.keys(UserMessages).filter(
        (key) => !isNaN(Number(UserMessages[key]))
    ),
    ...Object.keys(Continents).filter((key) => !isNaN(Number(Continents[key]))),
    ...Object.keys(CustomSubscriptions).filter(
        (key) => !isNaN(Number(CustomSubscriptions[key]))
    ),
    // Add countries by flag checkout
];

const singleParameterAfterCommandBulkMock = [
    ...Object.keys(UserRegExps).map((v) => [UserRegExps[v]]),
    ...Object.keys(Continents).map((v) => [Continents[v]]),
];

describe('getParameterAfterCommandFromMessage', () => {
    it('should return undefined if unsupported command', () => {
        const expectation = getParameterAfterCommandFromMessage(
            singleParameterAfterCommandMock,
            '/CommandDoesnotExist'
        );

        expect(expectation).toBeUndefined();
    });

    it('should return undefined if no arguments', () => {
        const expectation = getParameterAfterCommandFromMessage(
            singleParameterAfterCommandMock,
            '/country'
        );

        expect(expectation).toBeUndefined();
    });

    it('should return Ukraine', () => {
        const expectation = getParameterAfterCommandFromMessage(
            singleParameterAfterCommandMock,
            '/country Ukraine'
        );

        expect(expectation).toBe('Ukraine');
    });

    test.each(singleParameterAfterCommandBulkMock)(
        '.singleParameterAfterCommandBulkMock(%s)',
        (command) => {
            const expectation = getParameterAfterCommandFromMessage(
                singleParameterAfterCommandMock,
                `${command} PARAMETER`
            );

            expect(expectation).toBe('PARAMETER');
        }
    );
});
