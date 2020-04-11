export const addNumberChangeSymbol = (value: number): string => value > 0
    ? `+ ${value}`
    : `${value}`;
