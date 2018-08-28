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
var Path = require('path');
var SmocksHapi = require('testarmada-midway-smocks/hapi');
var MidwayUtils = require('./utils/common-utils');
var MidwayServer = require('./server-controller');

module.exports = {

  toPlugin: function (hapiPluginOptions, midwayOptions) {


    var midwayOptions = midwayOptions || {};
    // Normally the plugin/magellan is started from the automation directory.
    var mockDir = midwayOptions.mockedDirectory || './mocked-data';

    // Midways own plugin
    var fileHandler = require('./file-handler/file-handler')(Path.join(process.cwd(), mockDir));
    var respondWithFilePlugin = fileHandler;
    MidwayUtils.initFileHandler(fileHandler);

    // Use this the same way as we do in start.js
    // Create hapi server and then pass it around.

    // By default always initialize Midway plugins
    midwayOptions.respondWithFileHandler = respondWithFilePlugin;

    // Initialize URL Call Counts for setMockId
    MidwayUtils.initializeSessionURLCallCount();
    MidwayServer.addServerRoutesAndSessions(midwayOptions, midwayOptions.hapiServer);

    var plugin = SmocksHapi.toPlugin(hapiPluginOptions, midwayOptions);

    plugin.attributes = {
      sessions: midwayOptions.sessions || 0
    };

    return plugin;
  }

};


