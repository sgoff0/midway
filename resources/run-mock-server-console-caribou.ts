// require("./endpoints");
// require("./caribou-mocked-data");
require("./upgrade-mocked-data");

const midway = require("../index");
// import midway from '../src/index';
// import * as hapi from 'hapi';
const hapi = require('hapi');
const util = require("util");
import * as path from 'path';
import { appRoot, resourcesPath } from '../src/utils/pathHelpers';
const setMockVariantWithSession = util.promisify(
  midway.setMockVariantWithSession
);
const resetMockVariantWithSession = util.promisify(
  midway.resetMockVariantWithSession
);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // const mockedDirectory = path.join(resourcesPath, 'caribou-mocked-data');
  const mockedDirectory = path.join(resourcesPath, 'upgrade-mocked-data');
  const server = await midway.start({
    port: 8000,
    httpsPort: 4444,
    mockedDirectory,
    sessions: 2,
  });


  // console.log("Started server: ", server);

  // midway.addStte()
  // console.log("1");

  // await timeout(10000);

  // await setMockVariantWithSession({
  //   hostName: "localhost:8000",
  //   useHttp: true,
  //   fixtureToVariantMapping: {
  //     "GET /cardsvcs/acs/stmt/v1/statements": "withoutStatements",
  //   },
  //   midwaySessionId: 0,
  // }
  // );
  // console.log("Result: ", result);

  // midway.setMockVariantWithSession(
  //   {
  //     hostName: "localhost:8000",
  //     useHttp: true,
  //     fixtureToVariantMapping: {
  //       "GET /cardsvcs/acs/stmt/v1/statements": "withoutStatements",
  //     },
  //     midwaySessionId: 0,
  //   },
  //   (err, success) => {
  //     console.log("2");
  //     // console.log('Error', err);
  //     // console.log('Success', success);
  //   }
  // );

  // console.log("3");
  // await resetMockVariantWithSession(
  //   {
  //     hostName: "localhost:8000",
  //     useHttp: true,
  //     midwaySessionId: 0,
  //   },
  // );
  console.log("4");
}

main();

/*
const server = hapi.server({
  port: 3000,
  host: 'localhost'
});

const bootUpServer = async () => {
  await server.start();
  console.log(`Server is running at ${server.info.uri}`)

  // process.on('unhandledRejection', (err) => {
  //   console.log(err);
  //   process.exit(1);
  // })
}

bootUpServer();

*/