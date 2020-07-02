const path = require('path');
const fs = require('fs');

export const createErrFile = (err) => {
    const message =
        typeof err.message === 'object'
            ? JSON.stringify(err.message)
            : err.message;
    fs.writeFile(
        `${path.join(
            path.resolve('logs'),
            new Date().toISOString().split('T').join('_').replace(/[:.-]/g, '_')
        )}`,
        `Message:${message},\nName:${err.name},\nStack:${err.stack}`,
        (err) => {
            if (err) {
                // tslint:disable-next-line:no-console
                return console.log(err);
            }
        }
    );
};
