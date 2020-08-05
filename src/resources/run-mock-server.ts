// require('../resources/upgrade-mocked-data');
import './upgrade-mocked-data';

// const midway = require('../index');
import midway from '..';
// const util = require('util');
import * as util from 'util';
import * as path from 'path';
import { appRoot, resourcesPath } from '../utils/pathHelpers';
const setMockVariantWithSession = util.promisify(
    midway.setMockVariantWithSession,
);
const resetMockVariantWithSession = util.promisify(
    midway.resetMockVariantWithSession,
);

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const mockedDirectory = path.join(resourcesPath, 'upgrade-mocked-data');
    midway.start({
        port: 8000,
        mockedDirectory,
    });

    // midway.addStte()
    console.log('1');

    console.log('4');
}

main();
