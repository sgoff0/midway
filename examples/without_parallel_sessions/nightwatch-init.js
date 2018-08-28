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
// this is used as the nightwatch global object so we can have access
// to the worker global setup and teardown.  this module is referenced
// because it is defined as "globals_path" in the nightwatch.json file
var AppServer = require("./appServer");
var MidwayServer = require("./midwayServer");
var minimist = require("minimist"); //ADD THIS DEPENDENCY IN PACKAGE.JSON, IF YOU DON'T HAVE ALREADY

var midwayOptions = {
  host: process.env.HOST || "localhost",
  mockedDirectory: "./test/automation/mocked-data",
  port: 10000
};

module.exports = require("testarmada-midway-magellan-nightwatch").nightwatch({

  midwayOptions: midwayOptions,

  start: function (options, callback) {
    var log = options.log;

    log("nightwatch init: start");

    var argv = minimist(process.argv.slice(2));
    var appPort = parseInt(argv.mocking_port, 10);
    midwayOptions.appPort = appPort;
    midwayOptions.port = appPort + 2;

    log("nightwatch init:App port : " + midwayOptions.appPort +
      " ,Midway server port : " + midwayOptions.port);
    // start servers
    AppServer.start({mocksPort: midwayOptions.port, appPort: midwayOptions.appPort}, function () {
      log("nightwatch init: started app server. now starting midway server");
      MidwayServer.start(midwayOptions, function (err, server) {
        log("nightwatch init: started midway server");
        return callback(null, server);
      });
    });
  },

  stop: function (options, callback) {
    var log = options.log;
    log("nightwatch init: stop");
    AppServer.stop(function () {
      log("nightwatch init: stopped app server. not stopping midway server");
      MidwayServer.stop(function (err) {
        if (err) {
          log("nightwatch init: error in stopping midway server ", err);
        } else {
          log("nightwatch init: midway server stopped");
        }
        return callback();
      });
    });
  },

  logFile: __dirname + "/log.txt"
});

