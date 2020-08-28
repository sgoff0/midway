import midway from '../../index';
import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';
import { MIDWAY_API_PATH } from '../../smocks/constants';

describe('get-url-count-test', () => {
    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeAll(async () => {
        await getTestServer();
        request = getSuperTest();
    });
    // afterEach(() => {
    //     midway.resetMockId();
    //     midway.resetURLCount();
    // });
    afterAll(async () => {
        await stopTestServer();
    });

    it('check that first call returns right count', async () => {
        await request.get('/message').expect('Content-type', /json/);
        const response2 = await request.get(MIDWAY_API_PATH + '/getURLCount').expect('Content-type', /json/);
        expect(response2.body['message-GET']).toBe(1);
        const apiCount = midway.getURLCount();
        expect(apiCount['message-GET']).toBe(1);

    });
});