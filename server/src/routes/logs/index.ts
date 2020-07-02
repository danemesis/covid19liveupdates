import { Request, Response } from 'express';

const path = require('path');
const fs = require('fs');

export let logs = (req: Request, res: Response) => {
    // joining path of directory
    const directoryPath = path.resolve('logs');
    // passsing directoryPath and callback function
    fs.readdir(directoryPath, (err, files) => {
        // handling error
        if (err) {
            // tslint:disable-next-line:no-console
            return console.log('Unable to scan directory: ' + err);
        }
        // listing all files using forEach
        let filesData = '';
        files.reverse().forEach((file, i) => {
            // Do whatever you want to do with the file
            filesData = filesData.concat(
                `<div>File #${i}:\n ${fs.readFileSync(
                    path.join(path.resolve('logs'), file)
                )}<div/></br>`
            );
        });
        res.send(`<div>${filesData}</div>`);
    });
};
