import midway from '../../index';
import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer, getHTTPPort } from '../testHelper';

describe('set-mock-id-code-test', () => {
    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeAll(async () => {
        await getTestServer();
        request = getSuperTest();
    });
    afterAll(async () => {
        await stopTestServer();
    });

    it('should set the mock variant present in endpoints.js and return a valid response for variant in endpoints.js', async () => {
        const result = await midway.setMockVariant({
            mockPort: getHTTPPort(),
            fixture: 'message',
            variant: 'universe',
        });
        expect(result).toHaveProperty('fixture');

        const result2 = await request.get('/message')
            .expect('Content-type', /json/);
        expect(result2.body.collection.sectionOne.type).toBe('universe');
    });

    it('should set the mock variant even without port', async () => {
        const result = await midway.setMockVariant({
            fixture: 'message',
            variant: 'universe',
        });
        expect(result).toHaveProperty('fixture');

        const result2 = await request.get('/message')
            .expect('Content-type', /json/);
        console.log('Resp: ', result2.body);
        expect(result2.body.collection.sectionOne.type).toBe('universe');
    });
});