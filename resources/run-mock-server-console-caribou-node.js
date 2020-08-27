// require("./endpoints");
require('./upgrade-mocked-data');

const midway = require('../index');
console.log('Midway: ', midway);
const util = require('util');
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
  midway.start({
    port: 8000,
    httpsPort: 4444,
    mockedDirectory: './resources/upgrade-mocked-data',
    sessions: 2,
  });

  // midway.addStte()
  console.log('1');

  // await timeout(10000);

  await setMockVariantWithSession({
    hostName: 'localhost:8000',
    useHttp: true,
    fixtureToVariantMapping: {
      'GET /cardsvcs/acs/stmt/v1/statements': 'withoutStatements',
    },
    midwaySessionId: 0,
  });
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
  console.log('4');
}

main();
