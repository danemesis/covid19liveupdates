/**
 * Check out how it works here
 * https://codepen.io/belokha/pen/xxwOdWg?editors=0012
 */
export function getParameterAfterCommandFromMessage(
    singleParameterAfterCommands: Array<string>,
    userFullInput: string | undefined
): string | undefined {
    const makeMagicOverUserFullInput: string = singleParameterAfterCommands.find(
        (parameter) => parameter === userFullInput
    )
        ? userFullInput + ' ' // Problem is that userInput is the same as RegExp it returns null, but when it has
        : // at least one whitespace it is not null
          // https://codepen.io/belokha/pen/xxwOdWg?editors=0012, Example 5.
          userFullInput;

    const execResult = new RegExp(
        `(?<command>${singleParameterAfterCommands.join(
            '|\\'
        )})\\s(?<firstargument>.*)`
    ).exec(makeMagicOverUserFullInput);
    if (!execResult) {
        return undefined;
    }

    /* tslint:disable:no-string-literal */
    if (execResult.groups['command'] && !execResult.groups['firstargument']) {
        return undefined;
    }

    return execResult.groups['firstargument'];
    /* tslint:enable:no-string-literal */
}
