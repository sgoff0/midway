import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';
import constants from '../../constants';
import midway from '../..';
describe('reply-image-test - ', function () {

    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeEach(async () => {
        await getTestServer();
        request = getSuperTest();
        // midway.setMockId('images');
    });
    afterEach(async () => {
        midway.resetMockId();
        await stopTestServer();
    });

    // No image at this path
    it.skip('image file should be returned with setMockId api', async () => {
        const response = await request.get('/api/testImage');
        expect(response.type).toBe('image/jpeg');
    });

    it('image file should be returned with respondWithFile using variant', async () => {
        const response = await request.post(constants.MIDWAY_API_PATH + '/route/images').send({ variant: 'image-respondWithFile' }).expect(200);
        expect(response.status).toBe(200);

        const response2 = await request.get('/api/testImage').expect('Content-type', /image\/jpeg/);
        expect(response2.type).toBe('image/jpeg');
    });

    it('image file should be returned with respondWithFile using filepath', async () => {
        const response = await request.post(constants.MIDWAY_API_PATH + '/route/images').send({ variant: 'image-filepath' }).expect(200);
        expect(response.status).toBe(200);

        const response2 = await request.get('/api/testImage').expect('Content-type', /image\/jpeg/);

        expect(response2.type).toBe('image/jpeg');
        // expect(response2.header[constants.MOCKED_RESPONSE]).toBe('true');
    });
});