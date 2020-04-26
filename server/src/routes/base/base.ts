import { Request, Response } from 'express';
import { version } from '../../../../package.json';
import * as i18n from 'i18n';

export let base = (req: Request, res: Response) => {
    console.log('looocales', i18n.getLocales());
    console.log('catalog', i18n.getCatalog('ua'));
    console.log('looocales', i18n.__('Choose language'));
    console.log('looocales hash', i18n.__h('Choose language'));
    console.log('looocales all languages', i18n.__l('Choose language'));
    res.json({
        message:
            'Welcome to Covid19 live bot api. Refer to documentation here - https://github.com/danbilokha/covid19liveupdates',
        version: version ?? 'They didn\'n say me :c',
        containerVersion:
            process.env.CONTAINER_VERSION ??
            'They didn\'n say me :c But it should be the same as package.version',
    });
};
