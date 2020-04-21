import * as request from 'supertest';
import { app } from '../../index';
import { version } from '../../../../package.json';

// Package issue. Refer to https://github.com/request/request-promise/issues/247
// Particularly https://github.com/request/request-promise/issues/247#issuecomment-384343547
jest.mock('request-promise-native');

describe('GET /', () => {
    let serverResponse;
    beforeAll(async () => {
        serverResponse = await request(app).get('/');
    });

    it('should return 200 OK', async (done) => {
        expect(serverResponse.status).toEqual(200);
        done();
    });

    it('should return package.json version', async (done) => {
        expect(serverResponse.body.version).toEqual(version);
        done();
    });
});
