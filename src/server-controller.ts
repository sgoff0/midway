
/********
 Always initiate the static file handler to enable respondWithFile.
 *********/
import * as Path from 'path';
import MidwayUtils from './utils/common-utils';
import requestHandler from './route-handlers/request-handler';
import responseHandler from './route-handlers/response-handler';
import * as MidwayServerRoutes from './server-routes/midway-routes-manager';
import MidwayPluginController from './utils/midway-plugin-controller';
import * as Logger from 'testarmada-midway-logger';
import { argv as Argv } from './utils/configuration-parameters';
import Constants from './constants';
import ReadMockDataFromFile from './file-handler/file-handler';
import * as Hapi from '@hapi/hapi';
import { MidwayOptions } from './types/MidwayOptions';

class ServerController {

  public start = async (midwayOptions: MidwayOptions) => {
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

    Logger.info('Starting midway server on http at http://' + midwayOptions.host + ':' + midwayOptions.port + '/midway');
    if (midwayOptions.httpsPort) {
      Logger.info('Starting midway server on https at https://' + midwayOptions.host + ':' + midwayOptions.httpsPort + '/midway');
    }

    const server = createHapiServer(midwayOptions);
    this.addServerRoutesAndSessions(midwayOptions);

    Logger.debug("Init ReadMockDataFromFile");
    MidwayUtils.initFileHandler(midwayOptions.respondWithFileHandler);
    await MidwayPluginController.runHapiWithPlugins(server, midwayOptions);

    server.start();
    return server;
  };

  public stop = async (server: Hapi.Server): Promise<void> => {
    MidwayUtils.setServerRunningStatus(false);
    try {
      return await server.stop();
      Logger.debug('Midway server stopped');
    } catch (e) {
      Logger.error("Error stopping server", e);
    }
    return;
  };

  public addServerRoutesAndSessions = (midwayOptions: MidwayOptions) => {
    if (!MidwayUtils.isServerRunning()) {
      MidwayUtils.setServerRunningStatus(true);
      MidwayUtils.setServerProperties(midwayOptions);

      // Add midway server apis and plugins
      MidwayServerRoutes.addMidwayServerAPIs();
      Logger.debug('Sessions to add: ' + midwayOptions.sessions);

      // Intercept the response here using responseHandler
      // if (server) {
      //   Logger.warn("Mocked header not being set (TODO)");
      //   // TODO sgoff0 why is TS complaining?
      //   // server.ext('onPostHandler', responseHandler);
      // }

      // TODO sgoff0 should be fine as not using this type of session
      // TODO this needs to be refactored and requestHandler should be generic
      // TODO a request handler specific to session should be added and named differently
      // if (midwayOptions.sessions) {
      //   // Intercept the request and response here
      //   if (server) {
      //     server.ext('onRequest', requestHandler);
      //   }
      //   // add midway session routes
      //   MidwayServerRoutes.addRoutesToSessions(midwayOptions);
      // }

      // Initialize URL Call Counts
      MidwayUtils.initializeSessionURLCallCount();
    }
  };

}
function createHapiServer(midwayOptions: MidwayOptions) {
  const server = new Hapi.Server({
    port: midwayOptions.port,
  });
  return server;

}
export default new ServerController();