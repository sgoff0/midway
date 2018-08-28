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
var magellan = require("testarmada-magellan");
var AppServer = require("./appServer");
var MidwayServer = require("./midwayServer");
var MidwayMagellanNightwatch = require("testarmada-midway-magellan-nightwatch");

var midwayOptions = {
  host: "localhost",
  mockedDirectory: "./test/automation/mocked-data",

  //THIS VALUE SHOULD BE GREATER THAN OR EQUAL TO THE NUMBER OF WORKERS YOU RUN WITH
  sessions: 5, //DEFAULT VALUE

  port: 10000, //DEFAULT VALUE FOR LOCAL TESTING
  httpsPort: 10001, //DEFAULT VALUE FOR LOCAL TESTING
};

module.exports = MidwayMagellanNightwatch.magellan({

  midwayOptions: midwayOptions,

  before: function (options, callback) {
    var log = options.log; // Logs go in the filepath specified by `logFile`
    log("magellan-init.js:: before");

    // CALCULATE SESSIONS DYNAMICALLY BASED ON NUMBER OF WORKERS.
    // GET 20% MORE SESSIONS THAN WORKERS
    midwayOptions.sessions = MidwayMagellanNightwatch.Util.calculateSessions(options.workers, 20);
    log("magellan-init.js:: Sessions:" + midwayOptions.sessions);

    // Acquire free port
    magellan.portUtil.acquirePort(function (err, port) {
      if (err) {
        log("magellan-init.js before: Error in acquiring port :", err);
      } else {
        log("magellan-init.js before: Got port " + port + " for safe usage.");

        midwayOptions.appPort = port; // APP SERVER PORT
        midwayOptions.port = port + 2; // MOCK HTTP PORT
        midwayOptions.httpsPort = port + 3; // MOCK HTTPS PORT

        log("magellan-init.js before: session count is::" + midwayOptions.sessions);

        // start servers
        log("magellan-init.js before: starting application server");
        AppServer.start({mocksPort: midwayOptions.port, appPort: midwayOptions.appPort}, function () {
          log("magellan-init.js before: started application server");
          log("magellan-init.js before: starting midway server");
          MidwayServer.start(midwayOptions, function (error, server) {
            if (error) {
              return callback(error);
            }
            log("magellan-init.js before: started midway server");
            return callback(null, server);
          });
        });
      }
    });
  },

  after: function (options, callback) {
    var log = options.log;
    log("magellan-init.js after : stopping app server");

    AppServer.stop(function () {
      log("magellan-init.js:: stopped app server, now stopping midway server");
      MidwayServer.stop(function (err) {
        if (err) {
          log("magellan-init.js:: after : error in stopping Midway server:" + err);
        }
        return callback();
      });
    });
  },

  logFile: __dirname + "/log.txt"
});

