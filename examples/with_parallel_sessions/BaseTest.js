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
var Base = require("testarmada-nightwatch-extra/lib/base-test-class");
var util = require("util");
var dpro = require("dpro");

/**
 * base class used for the test classes (in ./tests).  it"s only real value
 * is to expose an "appUrl" function.  a global variable is introduced called "appPort"
 * which is the port on localhost that the current nightwatch worker is running
 * the application on
 */

var HomeBaseTest = function (steps) {
  // call super-constructor
  Base.call(this, steps);
};

util.inherits(HomeBaseTest, Base);

HomeBaseTest.prototype = {
  before: function (client, callback) {
    var self = this;
    // call super-before
    // do basic set up here.
    Base.prototype.before.call(this, client, function () {
      // call super-before
      // do basic set up here.
      client.registerSession(function (err, sessId) {
        if (err) {
          console.error(err);
          // throw new Error("Unable to get the sessionId");
          return callback(new Error("Unable to get the sessionId"));
        }
        self.midwaySessionId = sessId;
        client.midwaySessionId = sessId;
        return callback();
      });
    });
  },

  after: function (client, callback) {
    // call super-after
    // do the tear down here.
    var self = this;
    if (self.midwaySessionId) {
      client.closeSession(self.midwaySessionId, function (err) {
        if (err) {
          console.log("Error in closing session:" + self.midwaySessionId);
        }
        Base.prototype.after.call(self, client, callback);
      });
    } else {
      Base.prototype.after.call(self, client, callback);
    }
  },

  appUrl: function (path) {
    if (dpro.mock && dpro.mock === true) {
      var host = process.env.HOST || "localhost";
      var serverPath = "http://" + host + ":" + process.env.APP_SERVER_PORT + path;
      if (this.midwaySessionId) {
        serverPath += "?midwaySessionId=" + this.midwaySessionId;
      }

      console.log("-------- Using Mock Service: App url=" + serverPath + "--------");
      return serverPath;
    } else {
      var liveServicesServerPath = dpro.server.host + path;

      console.log("-------- Using Live Service: App url=" + liveServicesServerPath + "--------");
      return "http://" + liveServicesServerPath;
    }
  }
};

module.exports = HomeBaseTest;

