import {Request, Response} from 'express';

const pkg = require(__dirname + '/../../../../package.json');

export let base = (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to Covid19 live bot api. Refer to documentation here - https://github.com/danbilokha/covid19liveupdates',
        version: pkg.version || 'They didn\'n say me :c',
        containerVersion: process.env.CONTAINER_VERSION || 'They didn\'n say me :c But it should be the same as package.version',
    });
};
