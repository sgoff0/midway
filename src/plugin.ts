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

    const plugin = SmocksHapi.toPlugin(hapiPluginOptions);

    // TODO sgoff0 how do we pass "attributes" in new plugin world?
    // plugin.sessions = midwayOptions.sessions || 0
    // plugin.attributes = {
    //   sessions: midwayOptions.sessions || 0
    // };

    return plugin;
  }

};