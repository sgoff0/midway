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
var dpro = require("dpro");
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");
var midway = require("midway");
var mockUrlFilePath;
var appServerProcess;

module.exports = {
  start: function (options, callback) {
    console.log("*******appServer start");
    var back = function (err) {
      return callback(err);
    };

    if (dpro.mock) {

      console.log("*******Pointing App server to mock service and starting app server locally");
      var mocksPort = options.mocksPort;
      var appPort = options.appPort;
      var appDir = path.join(__dirname, "../../..");

      var spawn = childProcess.exec;
      var cmd;

      if (dpro.mock === true) {
        var host = process.env.HOST || "localhost";
        // Read the base config file
        var mockBaseFile = path.join(appDir, "/config/local-mock.json");
        var mockBaseObject = JSON.parse(fs.readFileSync(mockBaseFile));

        // Substitute the URLs
        var mockUrlFile = JSON.stringify(mockBaseObject);

        mockUrlFile = mockUrlFile.replace(/localhost:8000/g, host + ":" + mocksPort);
        mockUrlFilePath = path.join(__dirname, "../../..", "config/local-" + appPort + ".json");

        // Write a dynamic file
        midway.util.writeFile(mockUrlFilePath, mockUrlFile, callback);

        console.log("*******-------Starting app server pointing to Mock Service-------");
        cmd = "NODE_APP_INSTANCE=" + appPort +
          " NODE_CONFIG_DIR=./config PORT=" + appPort +
          " ./node_modules/.bin/gulp server";
        console.log(" CMD to start server pointing to Mock Service: " + cmd);
        console.log(" Mock Port: " + mocksPort);

      } else {
        // Start local app server pointing to live service
        console.log("*******-------Starting app server pointing to Live Service-------");
        cmd = "NODE_CONFIG_DIR=./config ./node_modules/.bin/gulp server";
        console.log(" CMD to start server pointing to live Service: " + cmd);
      }

      appServerProcess = spawn(cmd, {
        cwd: appDir,
        maxBuffer: 5000 * 1024
      });

      appServerProcess.stderr.on("data", function (data) {
        console.log("*******Error when running app server: " + data);
      });

      appServerProcess.on("error", function (error) {
        console.log("*******Error when STARTING app server: " + error);
        back(error);
      });

      appServerProcess.stdout.on("data", function (data) {
        console.log("*******Starting app server: " + data);
        if (data.indexOf("Hapi.js server running at") > -1) {
          console.log("*******Application server STARTED with the process id,: " +
            appServerProcess.pid);
          back();
        }
      });
    } else {
      console.log("****No APP Server Started****");
      back();
    }
  },

  stop: function (callback) {
    console.log("*******appServer stop");
    var back = function (err) {
      return callback(err);
    };

    if (dpro.mock) {
      if (dpro.mock === true) {
        // Delete config file created for mocking
        midway.util.deleteFile(mockUrlFilePath);
      }

      console.log("*******Stopping app server locally :" + appServerProcess.pid);
      midway.util.killProcess(appServerProcess.pid);
      appServerProcess.on("close", function () {
        console.log("*******Application server STOPPED with process id: " + appServerProcess.pid);
        back();
      });

      appServerProcess.on("error", function () {
        console.log("*******Failed to stop APP Server with process id: " + appServerProcess.pid);
        back();
      });
    } else {
      console.log("****No APP Server Stopped****");
      back();
    }
  }
};

