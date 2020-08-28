import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';
describe('header-test - ', function () {
    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeAll(async () => {
        await getTestServer();
        request = getSuperTest();
    });
    afterAll(async () => {
        await stopTestServer();
    });
    it('check rest API setMockID exists and id can be set', async () => {
        const response = await request.get('/api/testHeaders').expect('Content-type', /json/);
        expect(response.status).toBe(200);
        expect(response.headers.header1).toBe('test1');
        expect(response.headers.header2).toBe('test2');
        expect(response.headers.header3).toBe('true');
        expect(response.body.test).toBe('I am header test');
    });
});