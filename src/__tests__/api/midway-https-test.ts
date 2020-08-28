import midway from '../../index';
import * as SuperTestRequest from 'supertest';
import * as path from 'path';
import { appRoot, resourcesPath } from '../../utils/pathHelpers';
import * as util from 'util';
import * as Hapi from '@hapi/hapi';

const setMockVariant = util.promisify(midway.setMockVariant);
const mockedDirectory = path.join(resourcesPath, 'upgrade-mocked-data');
require(mockedDirectory);

describe('Midway Server', function () {
  let myServer: Hapi.Server;
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  beforeAll(async () => {
    const server = await midway.start(
      {
        port: 3000,
        mockedDirectory,
      });
    myServer = server;
    request = SuperTestRequest('http://localhost:3000');
  });
  afterEach(async () => {
    // Reset input (with current implementation of midway, starting/stopping actually preserves some state)
    await request.post('/midway/api/input/reset');
  });
  afterAll(async () => {
    await midway.stop(myServer);
  });
  it('should be able to read valid endpoint', async () => {
    // console.log("URl count: ", midway.getURLCount());
    const result = await request.get('/portal');
    expect(result.status).toBe(200);
  });
  it('should get 404 on made up endpoint', async () => {
    // console.log("URl count: ", midway.getURLCount());
    const result = await request.get('/portal-not-a-real-endpoint');
    expect(result.status).toBe(404);
  });
  it('variants should return different results', async () => {
    // console.log("URl count: ", midway.getURLCount());
    const result = await request.post('/portal');
    expect(result.status).toBe(200);
    await setMockVariant({
      mockPort: 3000,
      fixture: 'POST /portal',
      variant: 'Bank-OOB',
    });
    const result2 = await request.post('/portal');
    expect(result2.status).toBe(401);
  });
  it('should read 16 routes for use in admin interface', async () => {
    const result = await request.get('/midway-data');
    // True while test data doesn't changae
    expect(result.body.routes).toHaveLength(16);
  });
  it('should read desired response body from endpoint', async () => {
    const result = await request.get('/portal');
    expect(result.body.accounts).toHaveLength(1);
  });
  it('should read header from endpoint', async () => {
    const result = await request.get('/portal');
    console.log("Header: ", result.header);
    console.log("Headers: ", result.headers);
    expect(result.headers['site-id']).toBe('Inet8TSYS');
  });
  it('should filter out problematic headers', async () => {
    const result = await request.get('/portal');
    expect(result.headers['transfer-encoding']).toBe(undefined);
  });
  it('should be able to use custom session approach to change session between multiple requests', async () => {
    const result1 = await request.post('/portal');
    expect(result1.status).toBe(200);

    await request.post('/midway/api/sessionVariantState/set/3').send({
      "POST /portal": "Bank-OOB"
    });

    // New session approach works
    const result2 = await request.post('/portal').set('x-request-session', '3');
    expect(result2.status).toBe(401);

    // Without impacting existing session
    const result3 = await request.post('/portal');
    expect(result3.status).toBe(200);
  });
  it('Invalid session uses defaults', async () => {
    const result2 = await request.post('/portal').set('x-request-session', 'some-session-id-not-set-with-data');
    expect(result2.status).toBe(200);
  });
});
