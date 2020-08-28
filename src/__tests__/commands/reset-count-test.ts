import midway from '../../index';
import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';

describe('reset-count-test', () => {
    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeAll(async () => {
        await getTestServer();
        request = getSuperTest();
    });
    beforeEach(() => {
        midway.setMockId('set-mock-id');
    });
    // afterEach(() => {
    //     midway.resetMockId();
    //     midway.resetURLCount();
    // });
    afterAll(async () => {
        await stopTestServer();
    });

    it('Instance 1: should return data from file 1 for two calls on resetting count after 1', async () => {
        const response = await request.get('/api/setMockId1').expect('Content-type', /json/);
        expect(response.body.test).toBe(1);
        midway.resetURLCount();

        const response2 = await request.get('/api/setMockId1').expect('Content-type', /json/);
        expect(response2.body.test).toBe(1);
    });
});