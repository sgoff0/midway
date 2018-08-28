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
// load mocked endpoint
require('./endpoints');
var midway = require('../index');
var Logger = require('testarmada-midway-logger');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  start: function (options, callback) {
    midway.start({
      port: 3000,
      httpsPort: 4444,
      host: 'localhost',
      mockedDirectory: './resources/mocked-data',
      sessions: 5
    }, callback);
  },

  stop: function (server, callback) {
    midway.util.setServerRunningStatus(false);
    midway.clearSessions();
    if (server) {
      server.stop(function (err) {
        if (err) {
          Logger.error(err);
        }
        if (callback) {
          return callback();
        }
      });
    }
  }
};

