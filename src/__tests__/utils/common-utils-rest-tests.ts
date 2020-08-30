import * as SuperTestRequest from 'supertest';

import { getTestServer, getSuperTest, stopTestServer } from '../testHelper';
import midway from '../../index';

describe('common-utils-rest-tests: ', () => {

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

  it('Check respondwithmockvariant works when ID is same as path', async function () {
    const res = await request.get('/respondWithVariant');
    expect(res.status).toBe(200);
    expect(res.text).toBe('I am an example of respond_with_mock_variant instead of response of main route');
  });

  it('Check respondwithmockvariant works when ID is diff than path', async function () {
    const res = await request.get('/respondWithVariantPathDiffFromId');
    expect(res.status).toBe(200);
    expect(res.text).toBe('respondWithVariantPathDiffFromId');
  });

  it('Check respondwithmockvariant return right error if variant Id not defined', async function () {
    const res = await request.get('/respondWithVariantError');
    expect(res.status).toBe(200);
    expect(res.text).toBe('No such variant: variant defined');
  });

  it('Check respondwithmockvariant sets to default handler', async function () {
    const res = await request.get('/respondWithVariant/1');
    expect(res.status).toBe(200);
    expect(res.text).toBe('I am an example of respond_with_mock_variant instead of response of main route - 1');
  });
});
