import midway from '../../index';
import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';

describe('reset-mock-id-test', () => {
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

    it('data should be returned from variant after resetting mock id', async () => {
        const response = await request.get('/api/setMockId1').expect('Content-type', /json/);
        expect(response.body.test).toBe(1);

        midway.resetMockId();
        midway.resetURLCount();

        const response2 = await request.get('/api/setMockId1').expect('Content-type', /json/);
        expect(response2.body.test).toBe('I am original and not from folder');
    });
});