import { Request, Response } from 'express';

let pkg = require(__dirname + '/../../../../package.json');

export let base = (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to API sekeleton. Browser doesn\'t update',
        version: pkg.version || 'Unkown',
    });
};
