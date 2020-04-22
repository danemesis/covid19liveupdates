import { Request, Response } from 'express';
import { version } from '../../../../package.json';
import { translateService } from '../../index';

export let base = (req: Request, res: Response) => {
    // console.log('translations', translateService.t);
    // console.log('translations', translateService.t('Hello'));
    // console.log('res', res.__);
    // console.log('res', res.__('Hello'));
    // console.log('req', res.t);
    res.json({
        // helloWorld: res.__('Hello World'),
        message:
            'Welcome to Covid19 live bot api. Refer to documentation here - https://github.com/danbilokha/covid19liveupdates',
        version: version ?? 'They didn\'n say me :c',
        containerVersion:
            process.env.CONTAINER_VERSION ??
            'They didn\'n say me :c But it should be the same as package.version',
    });
};
