import { isDeepStrictEqual } from 'util';

export const isTextEqual = (val1: string, val2: string): boolean =>
    isDeepStrictEqual(val1.toLocaleLowerCase(), val2.toLocaleLowerCase());
