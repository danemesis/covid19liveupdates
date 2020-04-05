import {getBorderCharacters, table} from 'table';

export const tableConfig = {
    columns: {
        0: {
            width: 15,
            paddingRight: 1
        },
        2: {
            width: 10
        }
    },
    columnDefault: {
        paddingLeft: 0,
        paddingRight: 0,
        width: 8
    },
    singleLine: false,
    border: getBorderCharacters("void")
};

export function table(tableBase: Array<Array<string>>, config: any): string {
    return table(tableBase, config);
};