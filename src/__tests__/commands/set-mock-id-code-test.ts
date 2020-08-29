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

    it('data should be returned from file 1 with code', async () => {
        const response = await request.get('/api/setMockIdCode').expect('Content-type', /json/);
        expect(response.body.test).toBe(1);
        expect(response.status).toBe(201);
    });
    it('data should be returned from file 2 with code', async () => {
        const response = await request.get('/api/setMockIdCode').expect('Content-type', /json/);
        expect(response.body.test).toBe(2);
        expect(response.status).toBe(202);
    });
    it('data should be returned from file 3 with code', async () => {
        const response = await request.get('/api/setMockIdCode').expect('Content-type', /json/);
        expect(response.body.test).toBe(3);
        expect(response.status).toBe(203);
    });
    it('data should be returned from default file with code', async () => {
        const response = await request.get('/api/setMockIdCode').expect('Content-type', /json/);
        expect(response.body.test).toBe('Default file');
        expect(response.status).toBe(300);
    });
});