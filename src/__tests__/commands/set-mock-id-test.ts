import midway from '../../index';
import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';

describe('set-mock-id-code-test', () => {
    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeAll(async () => {
        await getTestServer();
        request = getSuperTest();
        midway.setMockId('set-mock-id');
    });
    afterAll(async () => {
        await stopTestServer();
    });

    it('data should be returned from the folder "set-mock-id" for api setMockId1', async () => {
        const response = await request.get('/api/setMockId1').expect('Content-type', /json/);
        expect(response.body.test).toBe(1);
        expect(response.status).toBe(201);
    });
    it('data should be returned from the folder "set-mock-id" for api setMockId', async () => {
        const response = await request.get('/api/setMockId');
        expect(response.text).toBe('I am txt and should be returned for first call only.');
    });
    // TODO get this one working
    it.skip('data should be returned for url with dashes', async () => {
        const response = await request.get('/api/checkout-customer/1234/shipping-address');
        expect(response.body.test).toBe('url with  Dash response file');
    });
});