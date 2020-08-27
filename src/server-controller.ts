/**
* MIT License
*
* Copyright (c) 2018-present, Walmart Inc.,
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/

/********
 Always initiate the static file handler to enable respondWithFile.
 *********/
import * as Path from 'path';
import MidwayUtils from './utils/common-utils';
import requestHandler from './route-handlers/request-handler';
import responseHandler from './route-handlers/response-handler';
const Hapi = require('hapi');
import MidwayServerRoutes from './server-routes/midway-routes-manager';
import MidwayPluginController from './utils/midway-plugin-controller';
import MetricsManager from './utils/metrics-manager';
import GenerateCertManager from './utils/generate-certificate-manager';
import * as Logger from 'testarmada-midway-logger';
import { argv as Argv } from './utils/configuration-parameters';
import Constants from './constants';
import ReadMockDataFromFile from './file-handler/file-handler';
// TODO sgoff0 fix me as i'm exported strangely
const internals = {
  start: undefined,
  addServerRoutesAndSessions: undefined,
  stop: undefined,
};

internals.start = async function (startOptions) {
  const midwayOptions = startOptions || {};
  const DEFAULT_MOCK_DIRECTORY = Path.join(process.cwd(), Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC);

  midwayOptions.startTime = new Date();
  midwayOptions.port = Argv.midwayPort || midwayOptions.port || 8080;
  midwayOptions.httpsPort = Argv.midwayHttpsPort || midwayOptions.httpsPort;
  midwayOptions.host = (Argv.midwayHost || midwayOptions.host || 'localhost').replace(/.*?:\/\//g, '');
  midwayOptions.project = midwayOptions.project || Constants.DEFAULT;
  midwayOptions.proxyPort = Argv.proxyPort || midwayOptions.proxyPort;
  midwayOptions.proxyHost = Argv.proxyHost || midwayOptions.proxyHost || 'localhost';
  midwayOptions.mockedDirectory = Argv.mockedData || midwayOptions.mockedDirectory || DEFAULT_MOCK_DIRECTORY;
  midwayOptions.sessions = Argv.midwaySessions || midwayOptions.sessions || 0;
  midwayOptions.resolvedPath = MidwayUtils.checkDirectoryExists(midwayOptions.mockedDirectory) ? midwayOptions.mockedDirectory : DEFAULT_MOCK_DIRECTORY;
  midwayOptions.respondWithFileHandler = ReadMockDataFromFile(midwayOptions.resolvedPath);

  if (midwayOptions.collectMetrics === undefined) {
    midwayOptions.collectMetrics = true;
  }

  // Set kairosdb url if passed in midway options and metrics is true
  if (midwayOptions.collectMetrics === true && midwayOptions[Constants.KAIROS_DB_URL]) {
    MidwayUtils.setKairosDbUrl(midwayOptions[Constants.KAIROS_DB_URL]);

    // Enable only if the metrics db url is passed in MidwayOptions ('metricsDB')
    MetricsManager.enableMetrics(midwayOptions.collectMetrics);
  }

  Logger.info('Starting midway server on http at http://' + midwayOptions.host + ':' + midwayOptions.port + '/midway');
  if (midwayOptions.httpsPort) {
    Logger.info('Starting midway server on https at https://' + midwayOptions.host + ':' + midwayOptions.httpsPort + '/midway');
  }

  // const server = new Hapi.Server({
  //   // port: midwayOptions.port,
  //   port: 8000,
  //   host: 'localhost',
  //   // labels: 'http'
  // });

  const server = createHapiServer(midwayOptions);

  internals.addServerRoutesAndSessions(midwayOptions, server);
  MidwayUtils.initFileHandler(midwayOptions.respondWithFileHandler);

  console.log('Before run hapi with plugins');
  await MidwayPluginController.runHapiWithPlugins(server, midwayOptions);
  console.log('After run hapi with plugins');
  // });

  server.start();

  return server;
};

internals.stop = function (server, callback) {
  MidwayUtils.setServerRunningStatus(false);
  const options = { timeout: 0 };
  server.stop(options, function (err) {
    if (err) {
      if (callback) {
        return callback(err);
      }
    }
    Logger.debug('Midway server stopped');
    if (callback) {
      return callback();
    }
  });
};

internals.addServerRoutesAndSessions = function (midwayOptions, server) {
  if (!MidwayUtils.isServerRunning()) {
    MidwayUtils.setServerRunningStatus(true);
    MidwayUtils.setServerProperties(midwayOptions);

    // Add midway server apis and plugins
    MidwayServerRoutes.addMidwayServerAPIs();
    Logger.debug('Sessions to add: ' + midwayOptions.sessions);

    // Intercept the response here using responseHandler
    if (server) {
      server.ext('onPostHandler', responseHandler);
    }

    // TODO this needs to be refactored and requestHandler should be generic
    // TODO a request handler specific to session should be added and named differently
    if (midwayOptions.sessions) {
      // Intercept the request and response here
      if (server) {
        console.warn("temp skip handler");
        // server.ext('onRequest', requestHandler);
      }
      // add midway session routes
      MidwayServerRoutes.addRoutesToSessions(midwayOptions);
    }

    // Initialize URL Call Counts
    MidwayUtils.initializeSessionURLCallCount();
  }
};

function createHapiServer(midwayOptions) {
  // const server = new Hapi.Server();
  // TODO sgoff0 restore https after hapi upgrade
  // if (midwayOptions.httpsPort) {
  //   GenerateCertManager.genCerts(midwayOptions.resolvedPath, function (err, tls) {
  //     server.connection({ port: midwayOptions.port, labels: 'http' });
  //     server.connection({ port: midwayOptions.httpsPort, labels: 'https', tls: tls });
  //     return callback(server);
  //   });
  // } else {
  // server.connection({ port: midwayOptions.port, labels: 'http' });
  const server = new Hapi.Server({
    port: midwayOptions.port,
    // labels: 'http'
  });
  return server;
  // }
}


// module.exports = internals;
export default internals;