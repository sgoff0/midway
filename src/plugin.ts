
/********
 Always initiate the static file handler to enable respondWithFile.
 *********/
import * as Path from 'path';
// const SmocksHapi = require('testarmada-midway-smocks/hapi');
import SmocksHapi from './smocks/hapi';
import MidwayUtils from './utils/common-utils';
// const MidwayServer = require('./server-controller');
import MidwayServer from './server-controller';
import ReadMockDataFromFile from './file-handler/file-handler';

export default {

  toPlugin: function (hapiPluginOptions, midwayOptions = { mockedDirectory: undefined, respondWithFileHandler: undefined, hapiServer: undefined, sessions: undefined }) {

    // Normally the plugin/magellan is started from the automation directory.
    const mockDir = midwayOptions.mockedDirectory || './mocked-data';

    // Midways own plugin
    const fileHandler = ReadMockDataFromFile(Path.join(process.cwd(), mockDir));
    const respondWithFilePlugin = fileHandler;
    MidwayUtils.initFileHandler(fileHandler);

    // Use this the same way as we do in start.js
    // Create hapi server and then pass it around.

    // By default always initialize Midway plugins
    midwayOptions.respondWithFileHandler = respondWithFilePlugin;

    // Initialize URL Call Counts for setMockId
    MidwayUtils.initializeSessionURLCallCount();
    MidwayServer.addServerRoutesAndSessions(midwayOptions, midwayOptions.hapiServer);

    const plugin = SmocksHapi.toPlugin(hapiPluginOptions, midwayOptions);

    plugin.attributes = {
      sessions: midwayOptions.sessions || 0
    };

    return plugin;
  }

};