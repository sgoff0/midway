"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../index");
const SuperTestRequest = require("supertest");
const path = require("path");
const pathHelpers_1 = require("../../utils/pathHelpers");
const util = require("util");
const setMockVariant = util.promisify(index_1.default.setMockVariant);
const mockedDirectory = path.join(pathHelpers_1.resourcesPath, 'upgrade-mocked-data');
require(mockedDirectory);
describe('Midway Server', function () {
    let myServer;
    let request;
    beforeAll(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const server = yield index_1.default.start({
            port: 3000,
            mockedDirectory,
        });
        myServer = server;
        request = SuperTestRequest('http://localhost:3000');
    }));
    afterEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield request.post('/midway/api/input/reset');
    }));
    afterAll(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield index_1.default.stop(myServer);
    }));
    it('should be able to read valid endpoint', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield request.get('/portal');
        expect(result.status).toBe(200);
    }));
    it('should get 404 on made up endpoint', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield request.get('/portal-not-a-real-endpoint');
        expect(result.status).toBe(404);
    }));
    it('variants should return different results', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield request.post('/portal');
        expect(result.status).toBe(200);
        yield setMockVariant({
            mockPort: 3000,
            fixture: 'POST /portal',
            variant: 'Bank-OOB',
        });
        const result2 = yield request.post('/portal');
        expect(result2.status).toBe(401);
    }));
    it('should read 16 routes for use in admin interface', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield request.get('/midway-data');
        expect(result.body.routes).toHaveLength(16);
    }));
    it('should read desired response body from endpoint', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield request.get('/portal');
        expect(result.body.accounts).toHaveLength(1);
    }));
    it('should read header from endpoint', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield request.get('/portal');
        expect(result.headers['site-id']).toBe('Inet8TSYS');
    }));
    it('should filter out problematic headers', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield request.get('/portal');
        expect(result.headers['transfer-encoding']).toBe(undefined);
    }));
    it('should be able to use custom session approach to change session between multiple requests', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result1 = yield request.post('/portal');
        expect(result1.status).toBe(200);
        yield request.post('/midway/api/sessionVariantState/set/3').send({
            "POST /portal": "Bank-OOB"
        });
        const result2 = yield request.post('/portal').set('x-request-session', '3');
        expect(result2.status).toBe(401);
        const result3 = yield request.post('/portal');
        expect(result3.status).toBe(200);
    }));
    it('Invalid session uses defaults', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result2 = yield request.post('/portal').set('x-request-session', 'some-session-id-not-set-with-data');
        expect(result2.status).toBe(200);
    }));
});
//# sourceMappingURL=midway-https-test.js.map