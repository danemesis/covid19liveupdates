import {Request, Response} from 'express';

const pkg = require(__dirname + '/../../../../package.json');

export let base = (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to API.',
        version: pkg.version || 'Unkown',
        containerVersion: process.env.CONTAINER_VERSION || 'Unkown'
    });
};
