import {table, getBorderCharacters} from 'table';

export const tableConfig  = {
    columns: {
      0: {
        width: 25
      }
    },
    columnDefault: {
        paddingLeft: 0,
        paddingRight: 0,
        width:9
    },
    singleLine: true,
    border: getBorderCharacters("honeywell")
  };

  export function table(tableBase : Array<Array<string>>, config: any): string {
      return table(tableBase, config);
  };