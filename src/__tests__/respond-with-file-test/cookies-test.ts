import midway from '../../index';
import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';
describe('cookie-test - ', function () {

    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeAll(async () => {
        await getTestServer();
        request = getSuperTest();
    });
    afterAll(async () => {
        await stopTestServer();
    });
    it('check cookies are set', async () => {
        const response = await request.get('/api/testCookies').expect('Content-type', /json/);
        expect(response.status).toBe(200);
        const cookies = response.headers['set-cookie'];
        expect(cookies.length).toBe(3);
        // expect(cookies[0]).toBe('__smocks_state=static; Secure; HttpOnly; SameSite=Strict; Path=/');
        expect(cookies[0]).toBe('com.wm.customer=vz7.0b5c56; Secure; HttpOnly; SameSite=Strict');
        expect(cookies[1]).toBe('CID=SmockedCID; Secure; HttpOnly; SameSite=Strict; Domain=domain; Path=/');
        expect(cookies[2]).toBe('anotherCookie=cookieValue; Secure; HttpOnly; SameSite=Strict');
    });

    it('check no cookies are set', async () => {
        const response = await request.get('/api/testHeaders').expect('Content-type', /json/);
        expect(response.status).toBe(200);
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBe(undefined);
    });

});