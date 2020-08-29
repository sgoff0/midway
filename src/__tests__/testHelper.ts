import midway from '../index';
import * as SuperTestRequest from 'supertest';
import * as path from 'path';
import { resourcesPath } from '../utils/pathHelpers';
import * as Hapi from '@hapi/hapi';
// import '../resources/endpoints';

// declare global {
//     namespace NodeJS {
//         interface Global {
//             myServer: Hapi.Server;
//             request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
//         }
//     }
// }
// process.env.MIDWAY_LOG_LEVEL = 'error';

export const getHTTPPort = () => 3000;

export const getTestServer = async (): Promise<Hapi.Server> => {
    const mockedDirectory = path.join(resourcesPath, 'mocked-data');
    require('../resources/endpoints');
    return await midway.start({
        port: getHTTPPort(),
        mockedDirectory,
    });
};
export const stopTestServer = async (server?) => {
    await midway.stop(server);
};

export const getSuperTest = () => {
    return SuperTestRequest('http://localhost:3000');
};

const OLD_ENV = process.env;

beforeEach(() => {
    // TODO not sure this is working
    jest.resetAllMocks();// clears cache
    process.env.MIDWAY_LOG_LEVEL = 'error';
});
afterAll(() => {
    process.env = OLD_ENV;
});

/*
// let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
beforeAll(async () => {
    console.log("Starting midway...");
    const mockedDirectory = path.join(resourcesPath, 'mocked-data');
    require('../resources/endpoints');
    const server = await midway.start({
        port: 3000,
        mockedDirectory,
    });
    global.myServer = server;
    global.request = SuperTestRequest('http://localhost:3000');
});


function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

afterAll(async () => {
    console.log("Stopping midway...");
    try {
        await midway.stop(global.myServer);
    } catch (e) {
        // console.error('E: ', e);
        // Likely stopped too quickly, try again
        await timeout(500);
        await midway.stop(global.myServer);
    }
});
*/